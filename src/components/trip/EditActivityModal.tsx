"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateActivity, deleteActivity } from "@/actions/activities";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { X, Loader2, MapPin, Clock, DollarSign, FileText, Timer, Car, Trash2 } from "lucide-react";
import { Activity } from "@prisma/client";
import { PlacesAutocomplete } from "@/components/map/PlacesAutocomplete";
import { toast } from "sonner";

interface EditActivityModalProps {
    activity: Activity & { duration?: number; transportType?: string | null; travelTime?: number | null };
    isOpen: boolean;
    onClose: () => void;
}

const iconOptions = [
    { value: "MapPin", label: "📍 Location" },
    { value: "Bed", label: "🛏️ Hotel" },
    { value: "Coffee", label: "☕ Cafe" },
    { value: "Utensils", label: "🍽️ Restaurant" },
    { value: "Car", label: "🚗 Transport" },
    { value: "Camera", label: "📷 Sightseeing" },
    { value: "Mountain", label: "🏔️ Nature" },
];

const colorOptions = [
    { value: "orange", label: "Orange" },
    { value: "teal", label: "Teal" },
    { value: "pink", label: "Pink" },
    { value: "amber", label: "Amber" },
    { value: "green", label: "Green" },
    { value: "blue", label: "Blue" },
];

const transportOptions = [
    { value: "", label: "None (last activity)" },
    { value: "walking", label: "🚶 Walking" },
    { value: "grab", label: "🚗 Grab / Ride-hailing" },
    { value: "taxi", label: "🚕 Taxi" },
    { value: "driving", label: "🚙 Self-driving" },
    { value: "bus", label: "🚌 Bus" },
    { value: "train", label: "🚆 Train / MRT" },
    { value: "flight", label: "✈️ Flight" },
];

export function EditActivityModal({ activity, isOpen, onClose }: EditActivityModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState(activity.location ?? "");
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
        activity.latitude && activity.longitude
            ? { latitude: activity.latitude, longitude: activity.longitude }
            : null
    );

    // Reset state when activity changes
    useEffect(() => {
        setLocation(activity.location ?? "");
        setCoordinates(
            activity.latitude && activity.longitude
                ? { latitude: activity.latitude, longitude: activity.longitude }
                : null
        );
        setError(null);
    }, [activity.id, activity.location, activity.latitude, activity.longitude]);

    if (!isOpen) return null;

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await updateActivity(activity.id, formData);

        if (result.error) {
            setError(result.error);
            toast.error("Failed to update activity");
            setLoading(false);
        } else {
            setLoading(false);
            toast.success("Activity updated");
            router.refresh();
            onClose();
        }
    }

    async function handleDelete() {
        setDeleting(true);
        const result = await deleteActivity(activity.id);

        if (result.error) {
            setError(result.error);
            toast.error("Failed to delete activity");
            setDeleting(false);
        } else {
            setDeleting(false);
            setShowDeleteConfirm(false);
            toast.success("Activity deleted");
            router.refresh();
            onClose();
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Edit Activity
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete activity"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Activity Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                defaultValue={activity.title}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" /> Start Time *
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    required
                                    defaultValue={activity.time}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Timer className="w-4 h-4 inline mr-1" /> Duration (mins)
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    min="5"
                                    step="5"
                                    defaultValue={activity.duration ?? 60}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" /> Location
                                </label>
                                <PlacesAutocomplete
                                    value={location}
                                    onChange={setLocation}
                                    onPlaceSelected={(place) => {
                                        setLocation(place.address);
                                        setCoordinates({
                                            latitude: place.latitude,
                                            longitude: place.longitude,
                                        });
                                    }}
                                    placeholder="e.g., Boh Tea Centre"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                                />
                                <input type="hidden" name="location" value={location} />
                                {coordinates && (
                                    <>
                                        <input type="hidden" name="latitude" value={coordinates.latitude} />
                                        <input type="hidden" name="longitude" value={coordinates.longitude} />
                                    </>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" /> Cost (RM)
                                </label>
                                <input
                                    type="number"
                                    name="cost"
                                    min="0"
                                    step="0.01"
                                    defaultValue={activity.cost}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <FileText className="w-4 h-4 inline mr-1" /> Description
                            </label>
                            <textarea
                                name="description"
                                rows={2}
                                defaultValue={activity.description ?? ""}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white resize-none"
                            />
                        </div>

                        {/* Transport to next activity */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                                <Car className="w-4 h-4" /> Travel to Next Activity
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Transport Type
                                </label>
                                <select
                                    name="transportType"
                                    defaultValue={activity.transportType ?? ""}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                >
                                    {transportOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Travel time and distance will be calculated automatically by Google Maps
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Icon
                                </label>
                                <select
                                    name="icon"
                                    defaultValue={activity.icon}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                >
                                    {iconOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Color
                                </label>
                                <select
                                    name="color"
                                    defaultValue={activity.color}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                >
                                    {colorOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 rounded-xl dark:border-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Activity?"
                message={`Are you sure you want to delete "${activity.title}"? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={deleting}
                variant="danger"
            />
        </>
    );
}
