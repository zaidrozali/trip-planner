import { Client, TravelMode } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export interface DistanceResult {
  distanceKm: number;
  durationMinutes: number;
  distanceText: string;
  durationText: string;
}

/**
 * Calculate distance and duration between two coordinates using Google Directions API
 * @param origin - Starting coordinates { latitude, longitude }
 * @param destination - Ending coordinates { latitude, longitude }
 * @param mode - Travel mode (driving, walking, bicycling, transit)
 * @returns Distance and duration information or null if calculation fails
 */
export async function calculateDistance(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  mode: "driving" | "walking" | "bicycling" | "transit" = "driving"
): Promise<DistanceResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY environment variable is not set");
    return null;
  }

  try {
    // Map our transport types to Google Maps travel modes
    const travelModeMap: Record<string, TravelMode> = {
      driving: TravelMode.driving,
      walking: TravelMode.walking,
      bicycling: TravelMode.bicycling,
      transit: TravelMode.transit,
    };

    const response = await client.directions({
      params: {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode: travelModeMap[mode] || TravelMode.driving,
        key: apiKey,
      },
    });

    if (response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distanceKm: leg.distance.value / 1000, // Convert meters to kilometers
        durationMinutes: Math.ceil(leg.duration.value / 60), // Convert seconds to minutes
        distanceText: leg.distance.text, // e.g., "15.2 km"
        durationText: leg.duration.text, // e.g., "25 mins"
      };
    }

    console.warn("No routes found for the given coordinates");
    return null;
  } catch (error) {
    console.error("Error calculating distance:", error);
    return null;
  }
}

/**
 * Map transport type to Google Maps travel mode
 */
export function mapTransportTypeToTravelMode(
  transportType?: string | null
): "driving" | "walking" | "bicycling" | "transit" {
  if (!transportType) return "driving";

  const modeMap: Record<string, "driving" | "walking" | "bicycling" | "transit"> = {
    walking: "walking",
    grab: "driving",
    taxi: "driving",
    driving: "driving",
    bus: "transit",
    train: "transit",
    flight: "transit",
    bicycling: "bicycling",
  };

  return modeMap[transportType.toLowerCase()] || "driving";
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
