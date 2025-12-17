"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUser } from "./auth";
import { geocodeAddress } from "@/lib/geocoding";

export async function getTrips() {
    const user = await getUser();
    if (!user) return [];

    const trips = await db.trip.findMany({
        where: {
            OR: [
                { ownerId: user.id },
                { collaborators: { some: { userId: user.id } } },
            ],
        },
        include: {
            owner: true,
            days: {
                include: {
                    activities: {
                        orderBy: { time: "asc" }, // Sort by time (earliest first)
                    },
                },
                orderBy: { dayNumber: "asc" },
            },
            checklists: {
                include: {
                    items: {
                        orderBy: { order: "asc" },
                    },
                },
            },
            _count: {
                select: { days: true, collaborators: true },
            },
        },
        orderBy: { updatedAt: "desc" },
    });

    return trips;
}

export async function getTrip(id: string) {
    const user = await getUser();
    if (!user) return null;

    const trip = await db.trip.findFirst({
        where: {
            id,
            OR: [
                { ownerId: user.id },
                { collaborators: { some: { userId: user.id } } },
            ],
        },
        include: {
            owner: true,
            collaborators: {
                include: { user: true },
            },
            days: {
                include: {
                    activities: {
                        orderBy: { time: "asc" }, // Sort by time (earliest first)
                    },
                },
                orderBy: { dayNumber: "asc" },
            },
            checklists: {
                include: {
                    items: {
                        orderBy: { order: "asc" },
                    },
                },
            },
        },
    });

    return trip;
}

export async function createTrip(formData: FormData) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    const title = formData.get("title") as string;
    const location = formData.get("location") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const budget = parseFloat(formData.get("budget") as string) || 0;

    // Get coordinates from form data (if provided by autocomplete)
    let latitude: number | null = null;
    let longitude: number | null = null;

    const latitudeStr = formData.get("latitude") as string;
    const longitudeStr = formData.get("longitude") as string;

    if (latitudeStr && longitudeStr) {
        // Use coordinates from autocomplete
        latitude = parseFloat(latitudeStr);
        longitude = parseFloat(longitudeStr);
    } else if (location?.trim()) {
        // Fall back to geocoding if location provided but no coordinates
        const coords = await geocodeAddress(location);
        if (coords) {
            latitude = coords.latitude;
            longitude = coords.longitude;
        }
    }

    // Calculate number of days
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const trip = await db.trip.create({
        data: {
            title,
            location,
            latitude,
            longitude,
            startDate,
            endDate,
            budget,
            ownerId: user.id,
            days: {
                create: Array.from({ length: dayCount }, (_, i) => ({
                    dayNumber: i + 1,
                    date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
                })),
            },
            checklists: {
                create: {
                    title: "Packing List",
                    shared: true,
                },
            },
        },
    });

    revalidatePath("/");
    return { success: true, tripId: trip.id };
}

export async function updateTrip(id: string, formData: FormData) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    const title = formData.get("title") as string;
    const location = formData.get("location") as string;
    const budget = parseFloat(formData.get("budget") as string) || 0;

    // Check if location changed and re-geocode if needed
    const existingTrip = await db.trip.findUnique({
        where: { id, ownerId: user.id },
        select: { location: true },
    });

    let latitude: number | null | undefined = undefined;
    let longitude: number | null | undefined = undefined;

    // Only geocode if location changed
    if (location !== existingTrip?.location) {
        if (location?.trim()) {
            const coords = await geocodeAddress(location);
            if (coords) {
                latitude = coords.latitude;
                longitude = coords.longitude;
            } else {
                // Clear coordinates if geocoding fails for new location
                latitude = null;
                longitude = null;
            }
        } else {
            // Clear coordinates if location removed
            latitude = null;
            longitude = null;
        }
    }

    await db.trip.update({
        where: { id, ownerId: user.id },
        data: {
            title,
            location,
            budget,
            ...(latitude !== undefined && { latitude }),
            ...(longitude !== undefined && { longitude }),
        },
    });

    revalidatePath("/");
    revalidatePath(`/trip/${id}`);
    return { success: true };
}

export async function deleteTrip(id: string) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    await db.trip.delete({
        where: { id, ownerId: user.id },
    });

    revalidatePath("/");
    return { success: true };
}

export async function deleteDay(dayId: string) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    // Get the day to find its trip and day number
    const day = await db.day.findUnique({
        where: { id: dayId },
        include: { trip: true },
    });

    if (!day) return { error: "Day not found" };
    if (day.trip.ownerId !== user.id) return { error: "Not authorized" };

    // Get total days count
    const daysCount = await db.day.count({
        where: { tripId: day.tripId },
    });

    // Don't allow deleting if only 1 day left
    if (daysCount <= 1) {
        return { error: "Cannot delete the only day. Delete the trip instead." };
    }

    // Delete the day (activities will cascade delete)
    await db.day.delete({
        where: { id: dayId },
    });

    // Renumber remaining days
    const remainingDays = await db.day.findMany({
        where: { tripId: day.tripId },
        orderBy: { date: "asc" },
    });

    for (let i = 0; i < remainingDays.length; i++) {
        await db.day.update({
            where: { id: remainingDays[i].id },
            data: { dayNumber: i + 1 },
        });
    }

    // Update trip end date
    if (remainingDays.length > 0) {
        await db.trip.update({
            where: { id: day.tripId },
            data: { endDate: remainingDays[remainingDays.length - 1].date },
        });
    }

    revalidatePath("/");
    return { success: true };
}

