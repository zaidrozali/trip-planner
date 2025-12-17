"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip } from "@/actions/trips";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Wallet, Loader2 } from "lucide-react";
import Link from "next/link";
import { PlacesAutocomplete } from "@/components/map/PlacesAutocomplete";

export default function NewTripPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Date state for validation
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

    const [startDate, setStartDate] = useState(formatDateInput(today));
    const [endDate, setEndDate] = useState(formatDateInput(nextWeek));
    const [location, setLocation] = useState("");
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

    // When start date changes, ensure end date is not earlier
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);

        // If current end date is before new start date, update end date
        if (endDate < newStartDate) {
            setEndDate(newStartDate);
        }
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await createTrip(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else if (result.success) {
            router.push("/");
        }
    }

    return (
        <div className="min-h-screen bg-[#f0fdfa] dark:bg-[#042f2e] p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="bg-white dark:bg-[#134e4a] rounded-3xl shadow-2xl shadow-teal-100/50 dark:shadow-teal-900/50 p-8 border border-white/50 dark:border-teal-800/50">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-teal-200 dark:shadow-teal-900/20">
                            🗺️
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create a New Trip
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Plan your next adventure
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Trip Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="e.g., Highland Romance: Glamping Adventure"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Location
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
                                placeholder="e.g., Cameron Highlands, Malaysia"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                            <input type="hidden" name="location" value={location} />
                            {coordinates && (
                                <>
                                    <input type="hidden" name="latitude" value={coordinates.latitude} />
                                    <input type="hidden" name="longitude" value={coordinates.longitude} />
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    required
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    required
                                    value={endDate}
                                    min={startDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Wallet className="w-4 h-4 inline mr-1" />
                                Budget (RM)
                            </label>
                            <input
                                type="number"
                                name="budget"
                                min="0"
                                step="0.01"
                                placeholder="e.g., 1000"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium shadow-md shadow-teal-200 dark:shadow-teal-900/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Create Trip"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
