"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUser } from "./auth";

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
