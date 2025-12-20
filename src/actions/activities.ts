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
            travelMode,
            false // Don't include alternatives for automatic calculations
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

    // Get max order and day info
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
            order: (lastActivity?.order ?? -1) + 1,
        },
    });

    // If this is the first activity, calculate distance from starting location
    if (!lastActivity && latitude && longitude) {
        const day = await db.day.findUnique({
            where: { id: dayId },
            select: {
                id: true,
                startingLatitude: true,
                startingLongitude: true,
                startingTransport: true,
            },
        });

        if (day?.startingLatitude && day?.startingLongitude) {
            const travelMode = mapTransportTypeToTravelMode(day.startingTransport);
            const result = await calculateDistance(
                { latitude: day.startingLatitude, longitude: day.startingLongitude },
                { latitude, longitude },
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
    } else if (lastActivity && lastActivity.id) {
        // Calculate distance from previous activity to this new one
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

/**
 * Recalculate distances for all activities in a day
 * This is useful when activities have coordinates but missing distance/duration data
 */
export async function recalculateDistancesForDay(dayId: string) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    const day = await db.day.findUnique({
        where: { id: dayId },
        include: {
            activities: {
                orderBy: { order: "asc" },
            },
        },
    });

    if (!day) return { error: "Day not found" };

    let calculatedCount = 0;
    let errorCount = 0;

    // Calculate distance from starting location to first activity
    if (day.startingLatitude && day.startingLongitude && day.activities.length > 0) {
        const firstActivity = day.activities[0];
        if (firstActivity.latitude && firstActivity.longitude) {
            const travelMode = mapTransportTypeToTravelMode(day.startingTransport);
            try {
                const result = await calculateDistance(
                    { latitude: day.startingLatitude, longitude: day.startingLongitude },
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
                    calculatedCount++;
                }
            } catch (error) {
                console.error("Error calculating starting location distance:", error);
                errorCount++;
            }
        }
    }

    // Calculate distances between consecutive activities
    for (let i = 0; i < day.activities.length - 1; i++) {
        const activity = day.activities[i];
        const nextActivity = day.activities[i + 1];

        // Skip if either activity doesn't have coordinates
        if (!activity.latitude || !activity.longitude ||
            !nextActivity.latitude || !nextActivity.longitude) {
            continue;
        }

        // Use transport type or default to driving
        const travelMode = mapTransportTypeToTravelMode(activity.transportType || "driving");

        try {
            const result = await calculateDistance(
                { latitude: activity.latitude, longitude: activity.longitude },
                { latitude: nextActivity.latitude, longitude: nextActivity.longitude },
                travelMode,
                false // Don't include alternatives for automatic calculations
            );

            if (result) {
                await db.activity.update({
                    where: { id: activity.id },
                    data: {
                        travelDistance: result.distanceKm,
                        travelTime: result.durationMinutes,
                    },
                });
                calculatedCount++;
            }
        } catch (error) {
            console.error(`Error calculating distance for activity ${activity.id}:`, error);
            errorCount++;
        }
    }

    revalidatePath("/");
    return {
        success: true,
        calculatedCount,
        errorCount,
        message: `Calculated ${calculatedCount} distances${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
        hasAlternatives: calculatedCount > 0, // Let UI know alternatives might be available
    };
}

/**
 * Get route alternatives between two activities
 */
export async function getRouteAlternatives(activityId: string) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

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

    if (!activity || !activity.latitude || !activity.longitude) {
        return { error: "Activity not found or missing coordinates" };
    }

    // Find the next activity
    const currentIndex = activity.day.activities.findIndex((a) => a.id === activityId);
    const nextActivity = activity.day.activities[currentIndex + 1];

    if (!nextActivity || !nextActivity.latitude || !nextActivity.longitude) {
        return { error: "No next activity or missing coordinates" };
    }

    const travelMode = mapTransportTypeToTravelMode(activity.transportType || "driving");
    const result = await calculateDistance(
        { latitude: activity.latitude, longitude: activity.longitude },
        { latitude: nextActivity.latitude, longitude: nextActivity.longitude },
        travelMode,
        true // Include alternatives
    );

    if (!result) {
        return { error: "Failed to calculate routes" };
    }

    return {
        success: true,
        currentRoute: {
            distanceKm: activity.travelDistance || result.distanceKm,
            durationMinutes: activity.travelTime || result.durationMinutes,
            distanceText: result.distanceText,
            durationText: result.durationText,
        },
        alternatives: result.alternatives || [],
    };
}

/**
 * Select a specific route alternative for an activity
 */
export async function selectRouteAlternative(
    activityId: string,
    distanceKm: number,
    durationMinutes: number
) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    await db.activity.update({
        where: { id: activityId },
        data: {
            travelDistance: distanceKm,
            travelTime: durationMinutes,
        },
    });

    revalidatePath("/");
    return { success: true };
}
