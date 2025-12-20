"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bed, Coffee, MapPin, Mountain, Plus, Utensils, Car, Camera, Clock, ArrowDown, Pencil, Wallet, RefreshCw, GitCompareArrows, Trash2 } from "lucide-react"
import { Trip, Day, Activity } from "@prisma/client"
import { AddActivityModal } from "./AddActivityModal";
import { EditActivityModal } from "./EditActivityModal";
import { StartingLocationCard } from "./StartingLocationCard";
import { RouteAlternativesModal } from "./RouteAlternativesModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDistance } from "@/lib/distance";
import { recalculateDistancesForDay, deleteActivity } from "@/actions/activities";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    MapPin,
    Bed,
    Coffee,
    Utensils,
    Car,
    Camera,
    Mountain,
};

const colorMap: Record<string, string> = {
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",
    teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
    pink: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
};

const transportIcons: Record<string, string> = {
    walking: "🚶",
    grab: "🚗",
    taxi: "🚕",
    driving: "🚙",
    bus: "🚌",
    train: "🚆",
    flight: "✈️",
};

type ActivityWithExtras = Activity & {
    duration?: number;
    transportType?: string | null;
    travelTime?: number | null;
    travelDistance?: number | null;
};

type DayWithStartingLocation = Day & {
    startingLocation?: string | null;
    startingLatitude?: number | null;
    startingLongitude?: number | null;
    startingTransport?: string | null;
    startingTravelDistance?: number | null;
    startingTravelTime?: number | null;
    activities: Activity[];
};

interface ActivityFeedProps {
    trip: Trip & {
        days: DayWithStartingLocation[]
    }
    selectedDay: number
}

export default function ActivityFeed({ trip, selectedDay }: ActivityFeedProps) {
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<ActivityWithExtras | null>(null);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [routeAlternativesActivityId, setRouteAlternativesActivityId] = useState<string | null>(null);
    const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const day = trip.days.find(d => d.dayNumber === selectedDay);
    const activities = (day?.activities ?? []) as ActivityWithExtras[];

    const routeAlternativesActivity = routeAlternativesActivityId
        ? activities.find(a => a.id === routeAlternativesActivityId)
        : null;
    const routeAlternativesNextActivity = routeAlternativesActivity
        ? activities[activities.findIndex(a => a.id === routeAlternativesActivityId) + 1]
        : null;

    const handleRecalculateDistances = async () => {
        if (!day?.id) return;

        setIsRecalculating(true);
        toast.loading("Calculating distances...");

        try {
            const result = await recalculateDistancesForDay(day.id);
            toast.dismiss();

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message || "Distances calculated successfully");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to calculate distances");
            console.error("Error recalculating distances:", error);
        } finally {
            setIsRecalculating(false);
        }
    };

    const handleDeleteActivity = async () => {
        if (!deletingActivityId) return;

        setIsDeleting(true);
        const result = await deleteActivity(deletingActivityId);

        if (result.error) {
            toast.error("Failed to delete activity");
            setIsDeleting(false);
        } else {
            setIsDeleting(false);
            setDeletingActivityId(null);
            toast.success("Activity deleted");
            router.refresh();
        }
    };

    // Calculate totals for the day
    const totalCost = activities.reduce((sum, a) => sum + a.cost, 0);
    const totalDuration = activities.reduce((sum, a) => sum + (a.duration ?? 60), 0);
    const totalTravelTime = activities.reduce((sum, a) => sum + (a.travelTime ?? 0), 0);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    const formatTime = (time: string) => {
        if (time.includes(":")) {
            const [hours, minutes] = time.split(":");
            const h = parseInt(hours);
            const ampm = h >= 12 ? "PM" : "AM";
            const displayHour = h % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        }
        return time;
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    // Calculate end time based on start time + duration
    const calculateEndTime = (startTime: string, durationMins: number) => {
        const [hours, minutes] = startTime.split(":").map(Number);
        const totalMins = hours * 60 + minutes + durationMins;
        const endHours = Math.floor(totalMins / 60) % 24;
        const endMins = totalMins % 60;
        return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
    };

    // Calculate expected arrival time at next activity
    const getExpectedArrival = (activity: ActivityWithExtras) => {
        const endTime = calculateEndTime(activity.time, activity.duration ?? 60);
        const travelTime = activity.travelTime ?? 0;
        const [hours, minutes] = endTime.split(":").map(Number);
        const totalMins = hours * 60 + minutes + travelTime;
        const arrivalHours = Math.floor(totalMins / 60) % 24;
        const arrivalMins = totalMins % 60;
        return formatTime(`${arrivalHours.toString().padStart(2, "0")}:${arrivalMins.toString().padStart(2, "0")}`);
    };

    return (
        <div className="flex-1 space-y-6">
            {/* Header with stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Day {selectedDay} - {day ? formatDate(day.date) : ""}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activities.length} Activities
                    </p>
                </div>
                <div className="flex gap-2">
                    {activities.length > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRecalculateDistances}
                            disabled={isRecalculating}
                            className="rounded-full"
                        >
                            <RefreshCw className={`w-4 h-4 mr-1 ${isRecalculating ? 'animate-spin' : ''}`} />
                            Calculate Distances
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200 dark:shadow-teal-900/20 rounded-full border-0"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Activity
                    </Button>
                </div>
            </div>

            {/* Day Summary Stats */}
            {activities.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3 border border-teal-100 dark:border-teal-800">
                        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs font-medium">Day Cost</span>
                        </div>
                        <p className="text-lg font-bold text-teal-700 dark:text-teal-300">
                            RM {totalCost.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">Activity Time</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                            {formatDuration(totalDuration)}
                        </p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                            <Car className="w-4 h-4" />
                            <span className="text-xs font-medium">Travel Time</span>
                        </div>
                        <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                            {formatDuration(totalTravelTime)}
                        </p>
                    </div>
                </div>
            )}

            {/* Starting Location */}
            {day && (
                <StartingLocationCard
                    day={day}
                    hasActivities={activities.length > 0}
                />
            )}

            <div className="space-y-2">
                {activities.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Mountain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No activities planned for this day yet.</p>
                        <p className="text-sm">Click "Add Activity" to get started!</p>
                    </div>
                ) : (
                    activities.map((activity, index) => {
                        const Icon = iconMap[activity.icon] || MapPin;
                        const colorClass = colorMap[activity.color] || colorMap.orange;
                        const isLastActivity = index === activities.length - 1;
                        const duration = activity.duration ?? 60;
                        const transportType = activity.transportType;
                        const travelTime = activity.travelTime;
                        const travelDistance = activity.travelDistance;

                        return (
                            <div key={activity.id}>
                                {/* Activity Card */}
                                <Card
                                    className="border-l-4 border-l-transparent hover:border-l-teal-500 dark:hover:border-l-teal-400 transition-all hover:shadow-md group bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                                >
                                    <CardContent className="p-4 flex gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0" onClick={() => setEditingActivity(activity)} className="cursor-pointer">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                                                        {activity.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingActivity(activity);
                                                            }}
                                                            className="p-1 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors"
                                                            title="Edit activity"
                                                        >
                                                            <Pencil className="w-3 h-3 text-gray-400 hover:text-teal-600" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeletingActivityId(activity.id);
                                                            }}
                                                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                            title="Delete activity"
                                                        >
                                                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                        {formatTime(activity.time)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        RM {activity.cost.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Time range and duration */}
                                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(activity.time)} - {formatTime(calculateEndTime(activity.time, duration))}
                                                </span>
                                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                    {formatDuration(duration)}
                                                </span>
                                            </div>

                                            {activity.location && (
                                                <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                    <MapPin className="w-3 h-3 mr-1" /> {activity.location}
                                                </div>
                                            )}

                                            {activity.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                    {activity.description}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Transport connector (if not last activity and has transport info) */}
                                {!isLastActivity && transportType && (
                                    <div className="flex items-center justify-center py-2 gap-2">
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-full px-4 py-2 text-sm">
                                            <ArrowDown className="w-4 h-4 text-gray-400" />
                                            <span className="text-lg">{transportIcons[transportType] || "🚗"}</span>
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                                {transportType.charAt(0).toUpperCase() + transportType.slice(1)}
                                            </span>
                                            {(travelDistance || travelTime) && (
                                                <>
                                                    {travelDistance && (
                                                        <>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="text-gray-500 dark:text-gray-500 font-semibold">
                                                                {formatDistance(travelDistance)}
                                                            </span>
                                                        </>
                                                    )}
                                                    {travelTime && (
                                                        <>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="text-gray-500 dark:text-gray-500">
                                                                {formatDuration(travelTime)}
                                                            </span>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="text-teal-600 dark:text-teal-400 text-xs">
                                                                Arrive ~{getExpectedArrival(activity)}
                                                            </span>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {transportType === 'driving' && (travelDistance || travelTime) && (
                                            <button
                                                onClick={() => setRouteAlternativesActivityId(activity.id)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                                title="View alternative routes"
                                            >
                                                <GitCompareArrows className="w-4 h-4 text-gray-500 hover:text-teal-600" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Activity Modal */}
            {day && (
                <AddActivityModal
                    dayId={day.id}
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}

            {/* Edit Activity Modal */}
            {editingActivity && (
                <EditActivityModal
                    activity={editingActivity}
                    isOpen={true}
                    onClose={() => setEditingActivity(null)}
                />
            )}

            {/* Route Alternatives Modal */}
            {routeAlternativesActivity && routeAlternativesNextActivity && (
                <RouteAlternativesModal
                    activityId={routeAlternativesActivity.id}
                    activityTitle={routeAlternativesActivity.title}
                    nextActivityTitle={routeAlternativesNextActivity.title}
                    isOpen={!!routeAlternativesActivityId}
                    onClose={() => setRouteAlternativesActivityId(null)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deletingActivityId}
                onClose={() => setDeletingActivityId(null)}
                onConfirm={handleDeleteActivity}
                title="Delete Activity?"
                message={`Are you sure you want to delete this activity? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    )
}
