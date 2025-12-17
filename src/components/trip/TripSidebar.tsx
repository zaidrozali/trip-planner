"use client";

import { Button } from "@/components/ui/button"
import { CheckSquare, Map, Share } from "lucide-react"
import { Trip, Day, Checklist, ChecklistItem } from "@prisma/client"
import { toggleChecklistItem } from "@/actions/checklists"
import { useState } from "react"

interface TripSidebarProps {
    trip: Trip & {
        days: Day[]
        checklists: (Checklist & { items: ChecklistItem[] })[]
    }
}

export default function TripSidebar({ trip }: TripSidebarProps) {
    const [selectedDay, setSelectedDay] = useState(1);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    const handleToggleItem = async (itemId: string) => {
        await toggleChecklistItem(itemId);
    };

    const checklist = trip.checklists[0];
    const completedCount = checklist?.items.filter(i => i.completed).length ?? 0;
    const totalCount = checklist?.items.length ?? 0;

    return (
        <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            {/* Itinerary Nav */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Map className="w-4 h-4" /> Itinerary
                </h3>
                <div className="space-y-2">
                    {trip.days.map((day) => (
                        <Button
                            key={day.id}
                            variant={selectedDay === day.dayNumber ? "default" : "ghost"}
                            onClick={() => setSelectedDay(day.dayNumber)}
                            className={
                                selectedDay === day.dayNumber
                                    ? "w-full justify-start bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200 dark:shadow-teal-900/20 shadow-md border-0"
                                    : "w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                            }
                        >
                            <div className="text-left">
                                <div className="font-semibold text-sm">Day {day.dayNumber}</div>
                                <div className="text-xs opacity-80 font-normal">{formatDate(day.date)}</div>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Checklists */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" /> Checklists
                </h3>

                <div className="flex gap-2 mb-4">
                    <Button size="sm" variant="outline" className="flex-1 rounded-full text-xs h-7 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Share className="w-3 h-3 mr-1" /> Shared
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1 rounded-full text-xs h-7 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        My Own
                    </Button>
                </div>

                {checklist && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                        <h4 className="font-medium text-sm mb-3 dark:text-gray-200">
                            {checklist.title} <span className="text-gray-400 text-xs">({completedCount}/{totalCount})</span>
                        </h4>
                        <div className="space-y-2">
                            {checklist.items.slice(0, 5).map((item) => (
                                <label key={item.id} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={() => handleToggleItem(item.id)}
                                        className="mt-1 rounded border-gray-300 dark:border-gray-700 text-teal-600 focus:ring-teal-500 dark:bg-gray-800"
                                    />
                                    <span className={item.completed ? "line-through text-gray-400 dark:text-gray-600" : ""}>
                                        {item.text}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
