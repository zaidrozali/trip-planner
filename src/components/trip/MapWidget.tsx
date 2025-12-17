"use client";

import { GoogleMap, Marker, InfoWindow, Polyline, DirectionsRenderer } from "@react-google-maps/api";
import { useState, useEffect, useMemo } from "react";
import { MapPlaceholder } from "@/components/map/MapPlaceholder";
import { getColorHex, getDefaultMapCenter } from "@/lib/map-utils";
import { Clock, DollarSign, MapPin } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

interface Activity {
  id: string;
  title: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  color: string;
  icon: string;
  time: string;
  cost: number;
  duration: number;
  transportType?: string | null;
}

interface MapWidgetProps {
  activities: Activity[];
  tripLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function MapWidget({ activities, tripLocation }: MapWidgetProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [directions, setDirections] = useState<Map<string, google.maps.DirectionsResult>>(new Map());

  // Filter activities with valid coordinates
  const activitiesWithCoords = useMemo(
    () =>
      activities.filter(
        (a) => a.latitude !== null && a.longitude !== null
      ),
    [activities]
  );

  // Calculate map center
  const center = useMemo(() => {
    if (activitiesWithCoords.length > 0) {
      return {
        lat: activitiesWithCoords[0].latitude!,
        lng: activitiesWithCoords[0].longitude!,
      };
    }
    if (tripLocation) {
      return { lat: tripLocation.latitude, lng: tripLocation.longitude };
    }
    return getDefaultMapCenter("Cameron Highlands");
  }, [activitiesWithCoords, tripLocation]);

  // Fetch directions for routes between activities
  useEffect(() => {
    if (!map || activitiesWithCoords.length < 2) return;

    const directionsService = new google.maps.DirectionsService();
    const newDirections = new Map<string, google.maps.DirectionsResult>();

    const fetchDirections = async () => {
      for (let i = 0; i < activitiesWithCoords.length - 1; i++) {
        const activity = activitiesWithCoords[i];
        const nextActivity = activitiesWithCoords[i + 1];

        // Skip if no transport type set
        if (!activity.transportType) continue;

        const origin = { lat: activity.latitude!, lng: activity.longitude! };
        const destination = { lat: nextActivity.latitude!, lng: nextActivity.longitude! };

        // Map transport type to travel mode
        const travelModeMap: Record<string, google.maps.TravelMode> = {
          walking: google.maps.TravelMode.WALKING,
          driving: google.maps.TravelMode.DRIVING,
          grab: google.maps.TravelMode.DRIVING,
          taxi: google.maps.TravelMode.DRIVING,
          bus: google.maps.TravelMode.TRANSIT,
          train: google.maps.TravelMode.TRANSIT,
          flight: google.maps.TravelMode.DRIVING, // Fallback for flight
        };

        const travelMode = travelModeMap[activity.transportType.toLowerCase()] || google.maps.TravelMode.DRIVING;

        try {
          const result = await directionsService.route({
            origin,
            destination,
            travelMode,
          });

          if (result.routes.length > 0) {
            newDirections.set(`${activity.id}-${nextActivity.id}`, result);
          }
        } catch (error) {
          console.error("Error fetching directions:", error);
        }
      }

      setDirections(newDirections);
    };

    fetchDirections();
  }, [map, activitiesWithCoords]);

  // Auto-fit bounds when activities change
  useEffect(() => {
    if (map && activitiesWithCoords.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      activitiesWithCoords.forEach((activity) => {
        bounds.extend({
          lat: activity.latitude!,
          lng: activity.longitude!,
        });
      });
      map.fitBounds(bounds, 50); // 50px padding
    }
  }, [map, activitiesWithCoords]);

  // Show placeholder if no coordinates
  if (activitiesWithCoords.length === 0) {
    return (
      <MapPlaceholder message="Add locations to activities to see them on the map" />
    );
  }

  const selectedActivityData = selectedActivity
    ? activitiesWithCoords.find((a) => a.id === selectedActivity)
    : null;

  return (
    <div className="w-full lg:w-80 flex-shrink-0">
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 h-[400px] lg:h-[600px]">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={setMap}
          options={{
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          {/* Draw route lines between consecutive activities */}
          {activitiesWithCoords.map((activity, index) => {
            if (index === activitiesWithCoords.length - 1) return null;
            const nextActivity = activitiesWithCoords[index + 1];
            const routeKey = `${activity.id}-${nextActivity.id}`;
            const directionResult = directions.get(routeKey);

            // If we have directions, use DirectionsRenderer to show the route
            if (directionResult) {
              return (
                <DirectionsRenderer
                  key={routeKey}
                  directions={directionResult}
                  options={{
                    suppressMarkers: true, // We'll use our own custom markers
                    polylineOptions: {
                      strokeColor: "#0d9488",
                      strokeOpacity: 0.7,
                      strokeWeight: 4,
                    },
                  }}
                />
              );
            }

            // Fallback to straight line if no directions available
            return (
              <Polyline
                key={routeKey}
                path={[
                  { lat: activity.latitude!, lng: activity.longitude! },
                  { lat: nextActivity.latitude!, lng: nextActivity.longitude! },
                ]}
                options={{
                  strokeColor: "#94a3b8",
                  strokeOpacity: 0.4,
                  strokeWeight: 2,
                  geodesic: true,
                  strokePattern: [10, 5], // Dashed line for fallback
                }}
              />
            );
          })}

          {/* Render markers for activities */}
          {activitiesWithCoords.map((activity, index) => (
            <Marker
              key={activity.id}
              position={{
                lat: activity.latitude!,
                lng: activity.longitude!,
              }}
              onClick={() => setSelectedActivity(activity.id)}
              label={{
                text: `${index + 1}`,
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "bold",
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: getColorHex(activity.color),
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3,
              }}
            />
          ))}

          {/* Info Window for selected activity */}
          {selectedActivityData && (
            <InfoWindow
              position={{
                lat: selectedActivityData.latitude!,
                lng: selectedActivityData.longitude!,
              }}
              onCloseClick={() => setSelectedActivity(null)}
            >
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm text-gray-900 mb-2">
                  {selectedActivityData.title}
                </h3>
                {selectedActivityData.location && (
                  <div className="flex items-start gap-2 text-xs text-gray-600 mb-1">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{selectedActivityData.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>
                    {selectedActivityData.time} ({selectedActivityData.duration} min)
                  </span>
                </div>
                {selectedActivityData.cost > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <DollarSign className="w-3 h-3 flex-shrink-0" />
                    <span>RM {selectedActivityData.cost.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
