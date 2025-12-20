"use client";

import { useState, useMemo } from "react";
import TripHeader from "@/components/trip/TripHeader";
import TripSidebar from "@/components/trip/TripSidebar";
import ActivityFeed from "@/components/trip/ActivityFeed";
import MapWidget from "@/components/trip/MapWidget";
import TripSummary from "@/components/trip/TripSummary";
import { TravelAssistant } from "@/components/trip/TravelAssistant";
import { VisualTripSummary } from "@/components/trip/VisualTripSummary";
import { Trip, User, Day, Activity, Checklist, ChecklistItem } from "@prisma/client";

type TripWithRelations = Trip & {
    owner: User;
    days: (Day & { activities: Activity[] })[];
    checklists: (Checklist & { items: ChecklistItem[] })[];
};

interface TripDashboardProps {
    trip: TripWithRelations;
}

export function TripDashboard({ trip }: TripDashboardProps) {
    const [selectedDay, setSelectedDay] = useState(1);

    // Get activities for the selected day
    const selectedDayData = trip.days.find((d) => d.dayNumber === selectedDay);
    const dayActivities = selectedDayData?.activities ?? [];

    // Prepare trip location for map center
    const tripLocation = useMemo(() => {
        if (trip.latitude && trip.longitude) {
            return { latitude: trip.latitude, longitude: trip.longitude };
        }
        return null;
    }, [trip.latitude, trip.longitude]);

    // Get starting location for the selected day
    const startingLocation = useMemo(() => {
        if (selectedDayData?.startingLatitude && selectedDayData?.startingLongitude) {
            return {
                latitude: selectedDayData.startingLatitude,
                longitude: selectedDayData.startingLongitude,
                location: selectedDayData.startingLocation ?? "Starting Point",
                transportType: selectedDayData.startingTransport,
            };
        }
        return null;
    }, [selectedDayData]);

    return (
        <>
            <TripHeader trip={trip} />
            <TripSummary trip={trip} />

            {/* Visual Trip Summary */}
            <VisualTripSummary trip={trip} />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <TripSidebar
                    trip={trip}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                />
                <ActivityFeed
                    trip={trip}
                    selectedDay={selectedDay}
                />
                <MapWidget
                    activities={dayActivities}
                    tripLocation={tripLocation}
                    startingLocation={startingLocation}
                />
            </div>

            {/* AI Travel Assistant */}
            <TravelAssistant trip={trip} currentDay={selectedDay} totalDays={trip.days.length} />
        </>
    );
}


