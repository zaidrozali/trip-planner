"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { CheckSquare, Map, Share, Trash2, Loader2, Plus, Send } from "lucide-react"
import { Trip, Day, Checklist, ChecklistItem } from "@prisma/client"
import { toggleChecklistItem, addChecklistItem } from "@/actions/checklists"
import { deleteDay } from "@/actions/trips"
import { addDayToTrip } from "@/actions/days"

interface TripSidebarProps {
    trip: Trip & {
        days: Day[]
        checklists: (Checklist & { items: ChecklistItem[] })[]
    }
    selectedDay: number
    onSelectDay: (day: number) => void
}

export default function TripSidebar({ trip, selectedDay, onSelectDay }: TripSidebarProps) {
    const [deletingDayId, setDeletingDayId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ dayId: string; dayNumber: number } | null>(null);
    const [addingDay, setAddingDay] = useState(false);
    const [newItemText, setNewItemText] = useState("");
    const [addingItem, setAddingItem] = useState(false);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    const handleToggleItem = async (itemId: string) => {
        await toggleChecklistItem(itemId);
    };

    const handleAddDay = async () => {
        setAddingDay(true);
        const result = await addDayToTrip(trip.id);
        if (result.error) {
            alert(result.error);
        }
        setAddingDay(false);
    };

    const handleAddChecklistItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemText.trim() || !checklist) return;

        setAddingItem(true);
        await addChecklistItem(checklist.id, newItemText.trim());
        setNewItemText("");
        setAddingItem(false);
    };

    const handleDeleteDayConfirm = async () => {
        if (!deleteConfirm) return;

        setDeletingDayId(deleteConfirm.dayId);

        const result = await deleteDay(deleteConfirm.dayId);

        if (result.error) {
            alert(result.error);
        } else {
            if (selectedDay === deleteConfirm.dayNumber) {
                onSelectDay(1);
            } else if (selectedDay > deleteConfirm.dayNumber) {
                onSelectDay(selectedDay - 1);
            }
        }

        setDeletingDayId(null);
        setDeleteConfirm(null);
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
                        <div key={day.id} className="group flex items-center gap-1">
                            <Button
                                variant={selectedDay === day.dayNumber ? "default" : "ghost"}
                                onClick={() => onSelectDay(day.dayNumber)}
                                className={
                                    selectedDay === day.dayNumber
                                        ? "flex-1 justify-start bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200 dark:shadow-teal-900/20 shadow-md border-0"
                                        : "flex-1 justify-start text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                                }
                            >
                                <div className="text-left">
                                    <div className="font-semibold text-sm">Day {day.dayNumber}</div>
                                    <div className="text-xs opacity-80 font-normal">{formatDate(day.date)}</div>
                                </div>
                            </Button>

                            {trip.days.length > 1 && (
                                <button
                                    onClick={() => setDeleteConfirm({ dayId: day.id, dayNumber: day.dayNumber })}
                                    disabled={deletingDayId === day.id}
                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                                    title="Delete this day"
                                >
                                    {deletingDayId === day.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Day Button */}
                    <Button
                        variant="ghost"
                        onClick={handleAddDay}
                        disabled={addingDay}
                        className="w-full justify-start text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-300 border-2 border-dashed border-teal-200 dark:border-teal-800"
                    >
                        {addingDay ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        Add Day
                    </Button>
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
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {checklist.items.map((item) => (
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

                        {/* Add Item Input */}
                        <form onSubmit={handleAddChecklistItem} className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                placeholder="Add item..."
                                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!newItemText.trim() || addingItem}
                                className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addingItem ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Delete Day Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDeleteDayConfirm}
                title="Delete Day?"
                message={deleteConfirm ? `Are you sure you want to delete Day ${deleteConfirm.dayNumber}? All activities for this day will also be permanently deleted.` : ""}
                confirmText="Delete Day"
                isLoading={deletingDayId !== null}
                variant="danger"
            />
        </div>
    )
}
