"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDayStartingLocation } from "@/actions/days";
import { Home, MapPin, Loader2, Car, Pencil, ArrowDown } from "lucide-react";
import { PlacesAutocomplete } from "@/components/map/PlacesAutocomplete";
import { formatDistance } from "@/lib/distance";
import { Day } from "@prisma/client";
import { toast } from "sonner";

interface StartingLocationCardProps {
    day: Day & {
        startingLocation?: string | null;
        startingLatitude?: number | null;
        startingLongitude?: number | null;
        startingTransport?: string | null;
        startingTravelDistance?: number | null;
        startingTravelTime?: number | null;
    };
    hasActivities: boolean;
}

const transportOptions = [
    { value: "", label: "Select transport..." },
    { value: "walking", label: "🚶 Walking" },
    { value: "grab", label: "🚗 Grab / Ride-hailing" },
    { value: "taxi", label: "🚕 Taxi" },
    { value: "driving", label: "🚙 Self-driving" },
    { value: "bus", label: "🚌 Bus" },
    { value: "train", label: "🚆 Train / MRT" },
];

const transportIcons: Record<string, string> = {
    walking: "🚶",
    grab: "🚗",
    taxi: "🚕",
    driving: "🚙",
    bus: "🚌",
    train: "🚆",
};

export function StartingLocationCard({ day, hasActivities }: StartingLocationCardProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(day.startingLocation ?? "");
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
        day.startingLatitude && day.startingLongitude
            ? { latitude: day.startingLatitude, longitude: day.startingLongitude }
            : null
    );
    const [transportType, setTransportType] = useState(day.startingTransport ?? "");

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.set("location", location);
        formData.set("transportType", transportType);
        if (coordinates) {
            formData.set("latitude", coordinates.latitude.toString());
            formData.set("longitude", coordinates.longitude.toString());
        }

        await updateDayStartingLocation(day.id, formData);
        setLoading(false);
        setIsEditing(false);
        toast.success("Starting location saved");
        router.refresh();
    }

    // Empty state - show prompt to add starting location
    if (!day.startingLocation && !isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="w-full p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-teal-400 hover:text-teal-600 dark:hover:border-teal-500 dark:hover:text-teal-400 transition-all flex items-center justify-center gap-2 group"
            >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Set starting location (hotel, home, etc.)</span>
            </button>
        );
    }

    // Editing mode
    if (isEditing) {
        return (
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 border border-teal-100 dark:border-teal-800">
                <h4 className="text-sm font-semibold text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-2">
                    <Home className="w-4 h-4" /> Set Starting Location
                </h4>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Location (hotel, home, etc.)
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
                            placeholder="e.g., Grand Hyatt Kuala Lumpur"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Transport to first activity
                        </label>
                        <select
                            value={transportType}
                            onChange={(e) => setTransportType(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white text-sm"
                        >
                            {transportOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setLocation(day.startingLocation ?? "");
                                setCoordinates(
                                    day.startingLatitude && day.startingLongitude
                                        ? { latitude: day.startingLatitude, longitude: day.startingLongitude }
                                        : null
                                );
                                setTransportType(day.startingTransport ?? "");
                            }}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !location.trim()}
                            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Display mode - show starting location with travel info
    return (
        <div className="space-y-2">
            <div
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-xl p-4 border border-teal-100 dark:border-teal-800 cursor-pointer hover:shadow-md transition-all group"
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                Starting Point
                            </h4>
                            <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{day.startingLocation}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Travel connector to first activity */}
            {hasActivities && day.startingTransport && (
                <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-full px-4 py-2 text-sm">
                        <ArrowDown className="w-4 h-4 text-gray-400" />
                        <span className="text-lg">{transportIcons[day.startingTransport] || "🚗"}</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium capitalize">
                            {day.startingTransport}
                        </span>
                        {day.startingTravelDistance && (
                            <>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500 dark:text-gray-500 font-semibold">
                                    {formatDistance(day.startingTravelDistance)}
                                </span>
                            </>
                        )}
                        {day.startingTravelTime && (
                            <>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500 dark:text-gray-500">
                                    {formatDuration(day.startingTravelTime)}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
