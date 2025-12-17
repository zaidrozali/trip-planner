"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUser } from "./auth";
import { geocodeAddress } from "@/lib/geocoding";
import { calculateDistance, mapTransportTypeToTravelMode } from "@/lib/distance";

// Helper function to update distance between two consecutive activities
async function updateActivityDistance(activityId: string) {
    const activity = await db.activity.findUnique({
        where: { id: activityId },
        include: {
            day: {
                include: {
                    activities: {
                        orderBy: { order: "asc" },
                    },
                },
            },
        },
    });

    if (!activity || !activity.latitude || !activity.longitude) return;

    // Find the next activity
    const currentIndex = activity.day.activities.findIndex((a) => a.id === activityId);
    const nextActivity = activity.day.activities[currentIndex + 1];

    if (nextActivity && nextActivity.latitude && nextActivity.longitude) {
        // Calculate distance to next activity
        const travelMode = mapTransportTypeToTravelMode(activity.transportType);
        const result = await calculateDistance(
            { latitude: activity.latitude, longitude: activity.longitude },
            { latitude: nextActivity.latitude, longitude: nextActivity.longitude },
            travelMode
        );

        if (result) {
            // Update the activity with calculated distance and optionally duration
            await db.activity.update({
                where: { id: activityId },
                data: {
                    travelDistance: result.distanceKm,
                    // Only update travelTime if it wasn't manually set
                    ...(activity.travelTime === null && { travelTime: result.durationMinutes }),
                },
            });
        }
    }
}

export async function createActivity(dayId: string, formData: FormData) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const time = formData.get("time") as string;
    const duration = parseInt(formData.get("duration") as string) || 60;
    const cost = parseFloat(formData.get("cost") as string) || 0;
    const icon = formData.get("icon") as string || "MapPin";
    const color = formData.get("color") as string || "orange";
    const transportType = formData.get("transportType") as string || null;

    // Handle travel time as hours + minutes
    const travelTimeHours = parseInt(formData.get("travelTimeHours") as string) || 0;
    const travelTimeMins = parseInt(formData.get("travelTimeMins") as string) || 0;
    const travelTime = (travelTimeHours * 60 + travelTimeMins) || null;

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

    // Get max order
    const lastActivity = await db.activity.findFirst({
        where: { dayId },
        orderBy: { order: "desc" },
    });

    const activity = await db.activity.create({
        data: {
            dayId,
            title,
            description,
            location,
            latitude,
            longitude,
            time,
            duration,
            cost,
            icon,
            color,
            transportType: transportType || null,
            travelTime,
            order: (lastActivity?.order ?? -1) + 1,
        },
    });

    // Calculate distance from previous activity to this new one
    if (lastActivity && lastActivity.id) {
        await updateActivityDistance(lastActivity.id);
    }

    revalidatePath("/");
    return { success: true, activityId: activity.id };
}

export async function updateActivity(id: string, formData: FormData) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const time = formData.get("time") as string;
    const duration = parseInt(formData.get("duration") as string) || 60;
    const cost = parseFloat(formData.get("cost") as string) || 0;
    const icon = formData.get("icon") as string || "MapPin";
    const color = formData.get("color") as string || "orange";
    const transportType = formData.get("transportType") as string || null;

    // Handle travel time (can be hours/minutes or direct minutes)
    const travelTimeHours = parseInt(formData.get("travelTimeHours") as string) || 0;
    const travelTimeMins = parseInt(formData.get("travelTimeMins") as string) || 0;
    const travelTimeStr = formData.get("travelTime") as string;
    const travelTime = travelTimeHours || travelTimeMins
        ? (travelTimeHours * 60 + travelTimeMins) || null
        : travelTimeStr ? parseInt(travelTimeStr) : null;

    // Get coordinates from form data or check if location changed
    let latitude: number | null | undefined = undefined;
    let longitude: number | null | undefined = undefined;

    const latitudeStr = formData.get("latitude") as string;
    const longitudeStr = formData.get("longitude") as string;

    if (latitudeStr && longitudeStr) {
        // Use coordinates from autocomplete
        latitude = parseFloat(latitudeStr);
        longitude = parseFloat(longitudeStr);
    } else {
        // Check if location changed and re-geocode if needed
        const existingActivity = await db.activity.findUnique({
            where: { id },
            select: { location: true },
        });

        // Only geocode if location changed
        if (location !== existingActivity?.location) {
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
    }

    const updatedActivity = await db.activity.update({
        where: { id },
        data: {
            title,
            description,
            location,
            ...(latitude !== undefined && { latitude }),
            ...(longitude !== undefined && { longitude }),
            time,
            duration,
            cost,
            icon,
            color,
            transportType: transportType || null,
            travelTime,
        },
        include: {
            day: {
                include: {
                    activities: {
                        orderBy: { order: "asc" },
                    },
                },
            },
        },
    });

    // Recalculate distances if coordinates or transport type changed
    if (latitude !== undefined || transportType) {
        // Find previous activity and update its distance to this one
        const currentIndex = updatedActivity.day.activities.findIndex((a) => a.id === id);
        const previousActivity = updatedActivity.day.activities[currentIndex - 1];

        if (previousActivity) {
            await updateActivityDistance(previousActivity.id);
        }

        // Update this activity's distance to next activity
        await updateActivityDistance(id);
    }

    revalidatePath("/");
    return { success: true };
}

export async function deleteActivity(id: string) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    await db.activity.delete({ where: { id } });

    revalidatePath("/");
    return { success: true };
}
