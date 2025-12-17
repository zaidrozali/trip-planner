"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUser } from "./auth";

export async function createActivity(dayId: string, formData: FormData) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const time = formData.get("time") as string;
    const cost = parseFloat(formData.get("cost") as string) || 0;
    const icon = formData.get("icon") as string || "MapPin";
    const color = formData.get("color") as string || "orange";

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
            time,
            cost,
            icon,
            color,
            order: (lastActivity?.order ?? -1) + 1,
        },
    });

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
    const cost = parseFloat(formData.get("cost") as string) || 0;

    await db.activity.update({
        where: { id },
        data: { title, description, location, time, cost },
    });

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
