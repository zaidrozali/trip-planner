"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bed, Coffee, MapPin, Mountain, Plus, Utensils, Car, Camera } from "lucide-react"
import { Trip, Day, Activity } from "@prisma/client"

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

interface ActivityFeedProps {
    trip: Trip & {
        days: (Day & { activities: Activity[] })[]
    }
    selectedDay: number
}

export default function ActivityFeed({ trip, selectedDay }: ActivityFeedProps) {
    const day = trip.days.find(d => d.dayNumber === selectedDay);
    const activities = day?.activities ?? [];

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Day {selectedDay} - {day ? formatDate(day.date) : ""}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activities.length} Activities
                    </p>
                </div>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200 dark:shadow-teal-900/20 rounded-full border-0">
                    <Plus className="w-4 h-4 mr-1" /> Add Activity
                </Button>
            </div>

            <div className="space-y-4">
                {activities.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Mountain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No activities planned for this day yet.</p>
                        <p className="text-sm">Click "Add Activity" to get started!</p>
                    </div>
                ) : (
                    activities.map((activity) => {
                        const Icon = iconMap[activity.icon] || MapPin;
                        const colorClass = colorMap[activity.color] || colorMap.orange;

                        return (
                            <Card key={activity.id} className="border-l-4 border-l-transparent hover:border-l-teal-500 dark:hover:border-l-teal-400 transition-all hover:shadow-md group bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                                <CardContent className="p-4 flex gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate pr-2">
                                                {activity.title}
                                            </h3>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{activity.time}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">RM {activity.cost.toFixed(2)}</div>
                                            </div>
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
                        );
                    })
                )}
            </div>
        </div>
    )
}
