"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUser } from "./auth";

export async function toggleChecklistItem(id: string) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    const item = await db.checklistItem.findUnique({ where: { id } });
    if (!item) return { error: "Item not found" };

    await db.checklistItem.update({
        where: { id },
        data: { completed: !item.completed },
    });

    revalidatePath("/");
    return { success: true };
}

export async function addChecklistItem(checklistId: string, text: string) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    const lastItem = await db.checklistItem.findFirst({
        where: { checklistId },
        orderBy: { order: "desc" },
    });

    await db.checklistItem.create({
        data: {
            checklistId,
            text,
            order: (lastItem?.order ?? -1) + 1,
        },
    });

    revalidatePath("/");
    return { success: true };
}

export async function deleteChecklistItem(id: string) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    await db.checklistItem.delete({ where: { id } });

    revalidatePath("/");
    return { success: true };
}

export async function createChecklist(tripId: string, title: string) {
    const user = await getUser();
    if (!user) return { error: "Not authenticated" };

    await db.checklist.create({
        data: {
            tripId,
            title,
            shared: true,
        },
    });

    revalidatePath("/");
    return { success: true };
}
