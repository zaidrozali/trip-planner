"use client";

import { Trip, Day, Activity } from "@prisma/client";
import { MapPin, Clock, DollarSign, Navigation, Calendar, TrendingUp } from "lucide-react";

type TripWithRelations = Trip & {
    days: (Day & { activities: Activity[] })[];
};

interface VisualTripSummaryProps {
    trip: TripWithRelations;
}

export function VisualTripSummary({ trip }: VisualTripSummaryProps) {
    // Calculate statistics
    const totalActivities = trip.days.reduce((sum, day) => sum + day.activities.length, 0);
    const totalCost = trip.days.reduce(
        (sum, day) => sum + day.activities.reduce((daySum, activity) => daySum + activity.cost, 0),
        0
    );
    const totalDistance = trip.days.reduce(
        (sum, day) => sum + day.activities.reduce((daySum, activity) => daySum + (activity.travelDistance || 0), 0) + (day.startingTravelDistance || 0),
        0
    );
    const totalDuration = trip.days.reduce(
        (sum, day) => sum + day.activities.reduce((daySum, activity) => daySum + activity.duration, 0),
        0
    );

    // Find busiest day
    const busiestDay = trip.days.reduce((max, day) =>
        day.activities.length > (max?.activities.length || 0) ? day : max
    , trip.days[0]);

    // Calculate average cost per day
    const avgCostPerDay = trip.days.length > 0 ? totalCost / trip.days.length : 0;

    // Get transport breakdown
    const transportCounts = trip.days.reduce((acc, day) => {
        day.activities.forEach(activity => {
            if (activity.transportType) {
                acc[activity.transportType] = (acc[activity.transportType] || 0) + 1;
            }
        });
        return acc;
    }, {} as Record<string, number>);

    const transportIcons: Record<string, string> = {
        walking: "🚶",
        grab: "🚗",
        taxi: "🚕",
        driving: "🚙",
        bus: "🚌",
        train: "🚆",
    };

    return (
        <div className="space-y-6 my-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Your Trip at a Glance
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    A visual summary of your {trip.name} adventure
                </p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Distance */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 text-8xl">🗺️</div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Distance</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                            {totalDistance.toFixed(1)} km
                        </div>
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                            <div
                                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((totalDistance / 100) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            {(totalDistance / trip.days.length).toFixed(1)} km per day
                        </p>
                    </div>
                </div>

                {/* Total Cost */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 text-8xl">💰</div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Budget</span>
                        </div>
                        <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
                            RM {totalCost.toFixed(0)}
                        </div>
                        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                            <div
                                className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((totalCost / 1000) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            RM {avgCostPerDay.toFixed(0)} per day
                        </p>
                    </div>
                </div>

                {/* Total Activities */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 text-8xl">📍</div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Activities</span>
                        </div>
                        <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                            {totalActivities}
                        </div>
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                            <div
                                className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((totalActivities / 20) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                            Across {trip.days.length} days
                        </p>
                    </div>
                </div>

                {/* Total Time */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 text-8xl">⏱️</div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Time</span>
                        </div>
                        <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                            {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                        </div>
                        <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                            <div
                                className="bg-orange-600 dark:bg-orange-400 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((totalDuration / 480) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                            {Math.floor(totalDuration / trip.days.length / 60)}h per day
                        </p>
                    </div>
                </div>
            </div>

            {/* Transport Breakdown */}
            {Object.keys(transportCounts).length > 0 && (
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border-2 border-teal-200 dark:border-teal-800">
                    <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-4 flex items-center gap-2">
                        <span className="text-xl">🚗</span>
                        How You're Getting Around
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Object.entries(transportCounts).map(([type, count]) => (
                            <div key={type} className="text-center">
                                <div className="text-4xl mb-2">{transportIcons[type] || "🚗"}</div>
                                <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">{count}</div>
                                <div className="text-xs text-teal-600 dark:text-teal-400 capitalize">{type}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Day-by-Day Visual Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Your Journey Timeline
                </h3>
                <div className="space-y-4">
                    {trip.days.map((day, index) => {
                        const dayCost = day.activities.reduce((sum, a) => sum + a.cost, 0);
                        const dayDistance = day.activities.reduce((sum, a) => sum + (a.travelDistance || 0), 0) + (day.startingTravelDistance || 0);
                        const isBusiest = day.id === busiestDay?.id;

                        return (
                            <div key={day.id} className="relative">
                                {/* Connection line */}
                                {index < trip.days.length - 1 && (
                                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
                                )}

                                <div className="flex gap-4 items-start">
                                    {/* Day number badge */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white relative z-10 ${
                                        isBusiest
                                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                                            : 'bg-gradient-to-br from-teal-500 to-cyan-600'
                                    }`}>
                                        {day.dayNumber}
                                    </div>

                                    {/* Day card */}
                                    <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    Day {day.dayNumber}
                                                    {isBusiest && (
                                                        <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full">
                                                            🔥 Busiest Day
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {day.activities.length} activities planned
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mini stats */}
                                        <div className="flex gap-4 mt-3">
                                            <div className="flex items-center gap-1 text-sm">
                                                <span>💰</span>
                                                <span className="text-gray-700 dark:text-gray-300">RM {dayCost.toFixed(0)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm">
                                                <span>🗺️</span>
                                                <span className="text-gray-700 dark:text-gray-300">{dayDistance.toFixed(1)} km</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm">
                                                <span>📍</span>
                                                <span className="text-gray-700 dark:text-gray-300">{day.activities.length} stops</span>
                                            </div>
                                        </div>

                                        {/* Activities preview */}
                                        {day.activities.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {day.activities.slice(0, 3).map((activity) => (
                                                    <div
                                                        key={activity.id}
                                                        className="text-xs bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
                                                    >
                                                        {activity.title}
                                                    </div>
                                                ))}
                                                {day.activities.length > 3 && (
                                                    <div className="text-xs px-3 py-1 text-gray-500 dark:text-gray-500">
                                                        +{day.activities.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Fun Facts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-sm text-indigo-700 dark:text-indigo-300 mb-1">Busiest Day</div>
                    <div className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                        Day {busiestDay?.dayNumber || 1}
                    </div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400">
                        {busiestDay?.activities.length} activities
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
                    <div className="text-3xl mb-2">💸</div>
                    <div className="text-sm text-pink-700 dark:text-pink-300 mb-1">Avg. Daily Budget</div>
                    <div className="text-lg font-bold text-pink-900 dark:text-pink-100">
                        RM {avgCostPerDay.toFixed(0)}
                    </div>
                    <div className="text-xs text-pink-600 dark:text-pink-400">
                        Total: RM {totalCost.toFixed(0)}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-sm text-amber-700 dark:text-amber-300 mb-1">Trip Duration</div>
                    <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
                        {trip.days.length} Days
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                        {totalActivities} total experiences
                    </div>
                </div>
            </div>
        </div>
    );
}
