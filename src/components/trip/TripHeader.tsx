"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Calendar, Download, MapPin, Share2, Users, Wallet, Trash2 } from "lucide-react"
import { Trip, User, Day, Activity } from "@prisma/client"
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteTrip } from "@/actions/trips";

type ActivityWithCost = Activity & { cost: number };

interface TripHeaderProps {
    trip: Trip & {
        owner: User;
        days: (Day & { activities: ActivityWithCost[] })[];
    }
}

export default function TripHeader({ trip }: TripHeaderProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const dayCount = trip.days.length;

    // Calculate total spent from all activities
    const totalSpent = trip.days.reduce((sum, day) => {
        return sum + day.activities.reduce((daySum, activity) => daySum + activity.cost, 0);
    }, 0);

    const budgetPercent = trip.budget > 0 ? Math.min((totalSpent / trip.budget) * 100, 100) : 0;
    const remaining = trip.budget - totalSpent;
    const isOverBudget = remaining < 0;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const handleDeleteTrip = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteTrip(trip.id);
            if (result.success) {
                router.push("/");
                router.refresh();
            } else {
                console.error("Failed to delete trip:", result.error);
                alert("Failed to delete trip. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting trip:", error);
            alert("An error occurred while deleting the trip.");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <div className="space-y-6 pb-6 border-b border-gray-100 dark:border-gray-800 transition-colors">
            {/* Top Row: Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-200 dark:shadow-teal-900/20">
                        {trip.coverEmoji}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                            {trip.title}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{trip.location || "No location set"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 mr-2">
                        <div className="w-8 h-8 rounded-full bg-teal-200 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-teal-700">
                            {trip.owner.name?.[0] || trip.owner.email[0].toUpperCase()}
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="hidden sm:flex rounded-full dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Users className="w-4 h-4 mr-2" />
                        Invite
                    </Button>
                    <Button variant="outline" size="sm" className="hidden sm:flex rounded-full dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full dark:text-gray-300 dark:hover:bg-gray-800">
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setShowDeleteDialog(true)}
                        title="Delete Trip"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Bottom Row: Stats & Budget */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-transparent dark:border-gray-700">
                        <Calendar className="w-4 h-4 text-teal-500" />
                        <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span>{dayCount} Days</span>
                    </div>
                </div>

                <div className="w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Wallet className="w-3 h-3" /> Budget
                        </span>
                        <span className={isOverBudget ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-200"}>
                            RM {totalSpent.toFixed(2)} / RM {trip.budget.toFixed(2)}
                            {isOverBudget && (
                                <span className="ml-1 text-red-500">(Over by RM {Math.abs(remaining).toFixed(2)})</span>
                            )}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isOverBudget
                                    ? "bg-red-500"
                                    : budgetPercent > 80
                                        ? "bg-amber-500"
                                        : "bg-teal-500"
                                }`}
                            style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                        />
                    </div>
                    {!isOverBudget && remaining > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                            RM {remaining.toFixed(2)} remaining
                        </p>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteTrip}
                title="Delete Trip?"
                message={`Are you sure you want to delete "${trip.title}"? This will permanently delete all days, activities, and checklists. This action cannot be undone.`}
                confirmText="Delete Trip"
                cancelText="Cancel"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    )
}
