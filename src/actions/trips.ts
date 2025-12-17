"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUser } from "./auth";

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
                        orderBy: { order: "asc" },
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
                        orderBy: { order: "asc" },
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

    // Calculate number of days
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const trip = await db.trip.create({
        data: {
            title,
            location,
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

    await db.trip.update({
        where: { id, ownerId: user.id },
        data: { title, location, budget },
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
