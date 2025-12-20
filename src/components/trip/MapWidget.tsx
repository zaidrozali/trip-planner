"use client";

import { GoogleMap, Marker, InfoWindow, Polyline, DirectionsRenderer } from "@react-google-maps/api";
import { useState, useEffect, useMemo } from "react";
import { MapPlaceholder } from "@/components/map/MapPlaceholder";
import { getColorHex, getDefaultMapCenter } from "@/lib/map-utils";
import { Clock, DollarSign, MapPin, Home } from "lucide-react";

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
  startingLocation?: {
    latitude: number;
    longitude: number;
    location: string;
    transportType?: string | null;
  } | null;
}

export default function MapWidget({ activities, tripLocation, startingLocation }: MapWidgetProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [showStartingInfo, setShowStartingInfo] = useState(false);
  const [directions, setDirections] = useState<Map<string, google.maps.DirectionsResult>>(new Map());

  // Filter activities with valid coordinates
  const activitiesWithCoords = useMemo(
    () =>
      activities.filter(
        (a) => a.latitude !== null && a.longitude !== null
      ),
    [activities]
  );

  // Create a stable coordinate hash to detect changes
  const coordinatesHash = useMemo(() => {
    return activitiesWithCoords
      .map((a) => `${a.id}:${a.latitude},${a.longitude}`)
      .join("|");
  }, [activitiesWithCoords]);

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

  // Fetch directions for routes between activities and from starting location
  useEffect(() => {
    if (!map) {
      setDirections(new Map());
      return;
    }

    // Need at least one activity or starting location with first activity
    if (activitiesWithCoords.length < 1 && !startingLocation) {
      setDirections(new Map());
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const newDirections = new Map<string, google.maps.DirectionsResult>();

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

    const fetchDirections = async () => {
      // Fetch route from starting location to first activity
      if (startingLocation && activitiesWithCoords.length > 0 && startingLocation.transportType) {
        const firstActivity = activitiesWithCoords[0];
        const origin = { lat: startingLocation.latitude, lng: startingLocation.longitude };
        const destination = { lat: firstActivity.latitude!, lng: firstActivity.longitude! };
        const travelMode = travelModeMap[startingLocation.transportType.toLowerCase()] || google.maps.TravelMode.DRIVING;

        try {
          const result = await directionsService.route({
            origin,
            destination,
            travelMode,
          });

          if (result.routes.length > 0) {
            newDirections.set(`starting-${firstActivity.id}`, result);
          }
        } catch (error) {
          console.error("Error fetching starting location directions:", error);
        }
      }

      // Fetch routes between consecutive activities
      for (let i = 0; i < activitiesWithCoords.length - 1; i++) {
        const activity = activitiesWithCoords[i];
        const nextActivity = activitiesWithCoords[i + 1];

        // Skip if no transport type set
        if (!activity.transportType) continue;

        const origin = { lat: activity.latitude!, lng: activity.longitude! };
        const destination = { lat: nextActivity.latitude!, lng: nextActivity.longitude! };
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
  }, [map, coordinatesHash, startingLocation]);

  // Auto-fit bounds when activities or coordinates change
  useEffect(() => {
    if (map && (activitiesWithCoords.length > 0 || startingLocation)) {
      const bounds = new google.maps.LatLngBounds();

      // Include starting location in bounds
      if (startingLocation) {
        bounds.extend({
          lat: startingLocation.latitude,
          lng: startingLocation.longitude,
        });
      }

      // Include all activities in bounds
      activitiesWithCoords.forEach((activity) => {
        bounds.extend({
          lat: activity.latitude!,
          lng: activity.longitude!,
        });
      });

      // Add some padding around the markers
      const totalMarkers = activitiesWithCoords.length + (startingLocation ? 1 : 0);
      if (totalMarkers === 1) {
        // For single marker, just center and zoom
        map.setCenter(bounds.getCenter());
        map.setZoom(14);
      } else {
        // For multiple markers, fit bounds with padding
        map.fitBounds(bounds, 50);
      }
    }
  }, [map, activitiesWithCoords, coordinatesHash, startingLocation]);

  // Show placeholder if no coordinates
  if (activitiesWithCoords.length === 0 && !startingLocation) {
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
          {/* Starting location marker */}
          {startingLocation && (
            <Marker
              position={{
                lat: startingLocation.latitude,
                lng: startingLocation.longitude,
              }}
              onClick={() => {
                setShowStartingInfo(true);
                setSelectedActivity(null);
              }}
              label={{
                text: "🏠",
                fontSize: "16px",
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: "#0d9488",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3,
              }}
            />
          )}

          {/* Info Window for starting location */}
          {showStartingInfo && startingLocation && (
            <InfoWindow
              position={{
                lat: startingLocation.latitude,
                lng: startingLocation.longitude,
              }}
              onCloseClick={() => setShowStartingInfo(false)}
            >
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <Home className="w-4 h-4 text-teal-600" />
                  Starting Point
                </h3>
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{startingLocation.location}</span>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Draw route from starting location to first activity */}
          {startingLocation && activitiesWithCoords.length > 0 && (() => {
            const firstActivity = activitiesWithCoords[0];
            const routeKey = `starting-${firstActivity.id}`;
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
            if (startingLocation.transportType) {
              return (
                <Polyline
                  key={routeKey}
                  path={[
                    { lat: startingLocation.latitude, lng: startingLocation.longitude },
                    { lat: firstActivity.latitude!, lng: firstActivity.longitude! },
                  ]}
                  options={{
                    strokeColor: "#94a3b8",
                    strokeOpacity: 0.4,
                    strokeWeight: 2,
                    geodesic: true,
                  }}
                />
              );
            }

            return null;
          })()}

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
