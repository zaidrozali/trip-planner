"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRouteAlternatives, selectRouteAlternative } from "@/actions/activities";
import { toast } from "sonner";
import { formatDistance } from "@/lib/distance";

interface RouteAlternative {
    distanceKm: number;
    durationMinutes: number;
    distanceText: string;
    durationText: string;
    summary: string;
}

interface RouteAlternativesModalProps {
    activityId: string;
    activityTitle: string;
    nextActivityTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export function RouteAlternativesModal({
    activityId,
    activityTitle,
    nextActivityTitle,
    isOpen,
    onClose,
}: RouteAlternativesModalProps) {
    const [loading, setLoading] = useState(true);
    const [currentRoute, setCurrentRoute] = useState<RouteAlternative | null>(null);
    const [alternatives, setAlternatives] = useState<RouteAlternative[]>([]);
    const [selecting, setSelecting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadAlternatives();
        }
    }, [isOpen, activityId]);

    const loadAlternatives = async () => {
        setLoading(true);
        try {
            const result = await getRouteAlternatives(activityId);

            if (result.error) {
                toast.error(result.error);
                onClose();
                return;
            }

            if (result.success) {
                setCurrentRoute(result.currentRoute as RouteAlternative);
                setAlternatives(result.alternatives as RouteAlternative[]);
            }
        } catch (error) {
            console.error("Error loading alternatives:", error);
            toast.error("Failed to load route alternatives");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRoute = async (route: RouteAlternative) => {
        setSelecting(true);
        try {
            const result = await selectRouteAlternative(
                activityId,
                route.distanceKm,
                route.durationMinutes
            );

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Route updated successfully");
                onClose();
            }
        } catch (error) {
            console.error("Error selecting route:", error);
            toast.error("Failed to update route");
        } finally {
            setSelecting(false);
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Choose Route
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {activityTitle} → {nextActivityTitle}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Current Route */}
                            {currentRoute && (
                                <div className="border-2 border-teal-500 dark:border-teal-600 rounded-xl p-4 bg-teal-50 dark:bg-teal-900/20">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                            <span className="font-semibold text-teal-900 dark:text-teal-100">
                                                Current Route
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <MapPin className="w-4 h-4 text-teal-600" />
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Distance</div>
                                                <div className="font-semibold">{formatDistance(currentRoute.distanceKm)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <Clock className="w-4 h-4 text-teal-600" />
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                                                <div className="font-semibold">{formatDuration(currentRoute.durationMinutes)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Alternative Routes */}
                            {alternatives.length > 0 ? (
                                <>
                                    <div className="flex items-center gap-2 pt-2">
                                        <TrendingUp className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Alternative Routes
                                        </span>
                                    </div>
                                    {alternatives.map((alt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSelectRoute(alt)}
                                            disabled={selecting}
                                            className="w-full border-2 border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-600 rounded-xl p-4 bg-white dark:bg-gray-800 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                        >
                                            <div className="mb-3">
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {alt.summary}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Distance</div>
                                                        <div className="font-semibold">{formatDistance(alt.distanceKm)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                                                        <div className="font-semibold">{formatDuration(alt.durationMinutes)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p>No alternative routes available</p>
                                    <p className="text-sm mt-1">Only one route was found for this journey</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={selecting}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
