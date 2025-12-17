"use client";

import { useState, useMemo } from "react";
import TripHeader from "@/components/trip/TripHeader";
import TripSidebar from "@/components/trip/TripSidebar";
import ActivityFeed from "@/components/trip/ActivityFeed";
import MapWidget from "@/components/trip/MapWidget";
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

    return (
        <>
            <TripHeader trip={trip} />

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
                />
            </div>
        </>
    );
}
