"use client";

import { Trip, Day, Activity } from "@prisma/client";
import { Wallet, Route, Clock, MapPin, Calendar, Activity as ActivityIcon } from "lucide-react";
import { formatDistance } from "@/lib/distance";

type ActivityWithExtras = Activity & {
    duration?: number;
    travelTime?: number | null;
    travelDistance?: number | null;
};

type DayWithStarting = Day & {
    startingTravelDistance?: number | null;
    startingTravelTime?: number | null;
    activities: ActivityWithExtras[];
};

interface TripSummaryProps {
    trip: Trip & {
        days: DayWithStarting[];
    };
}

export default function TripSummary({ trip }: TripSummaryProps) {
    // Calculate all trip statistics
    const allActivities = trip.days.flatMap(day => day.activities);

    const totalSpent = allActivities.reduce((sum, a) => sum + a.cost, 0);

    // Include starting location distances from each day
    const startingDistances = trip.days.reduce((sum, day) => sum + (day.startingTravelDistance ?? 0), 0);
    const activityDistances = allActivities.reduce((sum, a) => sum + (a.travelDistance ?? 0), 0);
    const totalDistance = startingDistances + activityDistances;

    // Include starting travel times
    const startingTravelTimes = trip.days.reduce((sum, day) => sum + (day.startingTravelTime ?? 0), 0);
    const activityTravelTimes = allActivities.reduce((sum, a) => sum + (a.travelTime ?? 0), 0);
    const totalTravelTime = startingTravelTimes + activityTravelTimes;

    const totalActivityTime = allActivities.reduce((sum, a) => sum + (a.duration ?? 60), 0);
    const activityCount = allActivities.length;
    const dayCount = trip.days.length;

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const stats = [
        {
            label: "Total Spent",
            value: `RM ${totalSpent.toFixed(2)}`,
            icon: Wallet,
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            textColor: "text-emerald-600 dark:text-emerald-400",
            borderColor: "border-emerald-100 dark:border-emerald-800",
        },
        {
            label: "Total Distance",
            value: formatDistance(totalDistance),
            icon: Route,
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            textColor: "text-blue-600 dark:text-blue-400",
            borderColor: "border-blue-100 dark:border-blue-800",
        },
        {
            label: "Travel Time",
            value: formatDuration(totalTravelTime),
            icon: Clock,
            color: "from-amber-500 to-orange-500",
            bgColor: "bg-amber-50 dark:bg-amber-900/20",
            textColor: "text-amber-600 dark:text-amber-400",
            borderColor: "border-amber-100 dark:border-amber-800",
        },
        {
            label: "Activity Time",
            value: formatDuration(totalActivityTime),
            icon: ActivityIcon,
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            textColor: "text-purple-600 dark:text-purple-400",
            borderColor: "border-purple-100 dark:border-purple-800",
        },
        {
            label: "Activities",
            value: activityCount.toString(),
            icon: MapPin,
            color: "from-rose-500 to-red-500",
            bgColor: "bg-rose-50 dark:bg-rose-900/20",
            textColor: "text-rose-600 dark:text-rose-400",
            borderColor: "border-rose-100 dark:border-rose-800",
        },
        {
            label: "Days",
            value: dayCount.toString(),
            icon: Calendar,
            color: "from-indigo-500 to-violet-500",
            bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
            textColor: "text-indigo-600 dark:text-indigo-400",
            borderColor: "border-indigo-100 dark:border-indigo-800",
        },
    ];

    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                📊 Trip Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className={`${stat.bgColor} rounded-xl p-4 border ${stat.borderColor} transition-all hover:scale-[1.02] hover:shadow-md`}
                        >
                            <div className={`flex items-center gap-2 ${stat.textColor} mb-2`}>
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <p className={`text-xl font-bold ${stat.textColor}`}>
                                {stat.value}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {stat.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
