"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

interface UserMenuProps {
    user: User;
}

export function UserMenu({ user }: UserMenuProps) {
    const [open, setOpen] = useState(false);

    const initials = user.user_metadata?.full_name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() || user.email?.[0].toUpperCase() || "?";

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-sm font-bold text-teal-700 dark:text-teal-300 hover:ring-2 hover:ring-teal-500 transition-all"
            >
                {user.user_metadata?.avatar_url ? (
                    <img
                        src={user.user_metadata.avatar_url}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    initials
                )}
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user.user_metadata?.full_name || "User"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                            </p>
                        </div>

                        <div className="py-1">
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                <UserIcon className="w-4 h-4" />
                                Profile
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
