"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateTrip } from "@/actions/trips";
import { Button } from "@/components/ui/button";
import { X, Loader2, MapPin, Wallet, FileText } from "lucide-react";
import { Trip } from "@prisma/client";
import { PlacesAutocomplete } from "@/components/map/PlacesAutocomplete";
import { toast } from "sonner";

interface EditTripModalProps {
    trip: Trip;
    isOpen: boolean;
    onClose: () => void;
}

export function EditTripModal({ trip, isOpen, onClose }: EditTripModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState(trip.title);
    const [location, setLocation] = useState(trip.location ?? "");
    const [budget, setBudget] = useState(trip.budget.toString());
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
        trip.latitude && trip.longitude
            ? { latitude: trip.latitude, longitude: trip.longitude }
            : null
    );

    // Reset form when trip changes
    useEffect(() => {
        setTitle(trip.title);
        setLocation(trip.location ?? "");
        setBudget(trip.budget.toString());
        setCoordinates(
            trip.latitude && trip.longitude
                ? { latitude: trip.latitude, longitude: trip.longitude }
                : null
        );
        setError(null);
    }, [trip.id, trip.title, trip.location, trip.budget, trip.latitude, trip.longitude]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.set("title", title);
        formData.set("location", location);
        formData.set("budget", budget);
        if (coordinates) {
            formData.set("latitude", coordinates.latitude.toString());
            formData.set("longitude", coordinates.longitude.toString());
        }

        const result = await updateTrip(trip.id, formData);

        if (result.error) {
            setError(result.error);
            toast.error("Failed to update trip");
            setLoading(false);
        } else {
            setLoading(false);
            toast.success("Trip updated successfully");
            router.refresh();
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Edit Trip
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" /> Trip Name *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g., Japan Adventure"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                    </div>

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
                            placeholder="e.g., Tokyo, Japan"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Wallet className="w-4 h-4 inline mr-1" /> Budget (RM)
                        </label>
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
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
                            disabled={loading || !title.trim()}
                            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
