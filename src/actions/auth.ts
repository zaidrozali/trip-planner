"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error, data: authData } = await supabase.auth.signInWithPassword(data);

    if (error) {
        return { error: error.message };
    }

    // Sync user to database
    if (authData.user) {
        await db.user.upsert({
            where: { email: authData.user.email! },
            update: { name: authData.user.user_metadata?.full_name },
            create: {
                id: authData.user.id,
                email: authData.user.email!,
                name: authData.user.user_metadata?.full_name,
                avatarUrl: authData.user.user_metadata?.avatar_url,
            },
        });
    }

    revalidatePath("/", "layout");
    redirect("/");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const { error, data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Create user in database
    if (authData.user) {
        await db.user.upsert({
            where: { email: authData.user.email! },
            update: { name },
            create: {
                id: authData.user.id,
                email: authData.user.email!,
                name,
            },
        });
    }

    revalidatePath("/", "layout");
    redirect("/");
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/auth/login");
}

export async function loginWithGoogle() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.url) {
        redirect(data.url);
    }
}

export async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
