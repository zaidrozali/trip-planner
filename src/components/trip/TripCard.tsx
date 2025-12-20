"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, ChevronRight, Wallet, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteTrip } from "@/actions/trips";
import { toast } from "sonner";

interface TripCardProps {
    trip: {
        id: string;
        title: string;
        location: string | null;
        startDate: Date;
        endDate: Date;
        budget: number;
        coverEmoji: string | null;
        days: {
            activities: {
                cost: number;
            }[];
        }[];
    };
}

export function TripCard({ trip }: TripCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const totalCost = trip.days.reduce((sum, day) =>
        sum + day.activities.reduce((daySum, a) => daySum + a.cost, 0), 0
    );
    const activityCount = trip.days.reduce((sum, d) => sum + d.activities.length, 0);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteTrip(trip.id);

        if (result.error) {
            toast.error("Failed to delete trip");
            setIsDeleting(false);
        } else {
            toast.success("Trip deleted");
            setShowDeleteConfirm(false);
            router.refresh();
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-[#134e4a] rounded-2xl p-5 border border-gray-100 dark:border-teal-800 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-700 transition-all group flex items-center gap-4 relative">
                <Link
                    href={`/?trip=${trip.id}`}
                    className="absolute inset-0 z-0"
                />

                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl shadow-md flex-shrink-0 relative z-10">
                    {trip.coverEmoji}
                </div>

                <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                        {trip.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {trip.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {trip.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </span>
                    </div>
                </div>

                <div className="text-right flex-shrink-0 hidden sm:block relative z-10 pointer-events-none">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {trip.days.length} days
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {activityCount} activities
                    </div>
                </div>

                <div className="text-right flex-shrink-0 hidden md:block relative z-10 pointer-events-none">
                    <div className="flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400">
                        <Wallet className="w-3 h-3" />
                        RM {totalCost.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        of RM {trip.budget.toFixed(0)}
                    </div>
                </div>

                {/* Delete button - only visible on hover */}
                <div className="flex items-center gap-2 relative z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowDeleteConfirm(true);
                        }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete trip"
                    >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                    </button>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors flex-shrink-0 pointer-events-none" />
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Trip?"
                message={`Are you sure you want to delete "${trip.title}"? This will permanently delete all days, activities, and checklists associated with this trip. This action cannot be undone.`}
                confirmText="Delete Trip"
                isLoading={isDeleting}
                variant="danger"
            />
        </>
    );
}
