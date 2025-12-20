"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUser } from "./auth";
import { geocodeAddress } from "@/lib/geocoding";
import { calculateDistance, mapTransportTypeToTravelMode } from "@/lib/distance";

export async function addDayToTrip(tripId: string) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    // Get the trip
    const trip = await db.trip.findFirst({
        where: { id: tripId, ownerId: user.id },
        include: { days: { orderBy: { date: "desc" }, take: 1 } },
    });

    if (!trip) return { error: "Trip not found" };

    const lastDay = trip.days[0];
    const newDayNumber = lastDay ? lastDay.dayNumber + 1 : 1;
    const newDate = lastDay
        ? new Date(lastDay.date.getTime() + 24 * 60 * 60 * 1000)
        : new Date(trip.startDate);

    // Create new day
    await db.day.create({
        data: {
            tripId,
            dayNumber: newDayNumber,
            date: newDate,
        },
    });

    // Update trip end date
    await db.trip.update({
        where: { id: tripId },
        data: { endDate: newDate },
    });

    revalidatePath("/");
    return { success: true };
}

export async function updateDayStartingLocation(dayId: string, formData: FormData) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    const location = formData.get("location") as string;
    const transportType = formData.get("transportType") as string || null;

    // Get coordinates from form or geocode
    let latitude: number | null = null;
    let longitude: number | null = null;

    const latitudeStr = formData.get("latitude") as string;
    const longitudeStr = formData.get("longitude") as string;

    if (latitudeStr && longitudeStr) {
        latitude = parseFloat(latitudeStr);
        longitude = parseFloat(longitudeStr);
    } else if (location?.trim()) {
        const coords = await geocodeAddress(location);
        if (coords) {
            latitude = coords.latitude;
            longitude = coords.longitude;
        }
    }

    // Update day with starting location
    const day = await db.day.update({
        where: { id: dayId },
        data: {
            startingLocation: location || null,
            startingLatitude: latitude,
            startingLongitude: longitude,
            startingTransport: transportType,
        },
        include: {
            activities: {
                orderBy: { order: "asc" },
                take: 1,
            },
        },
    });

    // Calculate distance to first activity if we have coordinates
    if (latitude && longitude && day.activities.length > 0) {
        const firstActivity = day.activities[0];
        if (firstActivity.latitude && firstActivity.longitude) {
            const travelMode = mapTransportTypeToTravelMode(transportType);
            const result = await calculateDistance(
                { latitude, longitude },
                { latitude: firstActivity.latitude, longitude: firstActivity.longitude },
                travelMode,
                false // Don't include alternatives for automatic calculations
            );

            if (result) {
                await db.day.update({
                    where: { id: dayId },
                    data: {
                        startingTravelDistance: result.distanceKm,
                        startingTravelTime: result.durationMinutes,
                    },
                });
            }
        }
    }

    revalidatePath("/");
    return { success: true };
}

