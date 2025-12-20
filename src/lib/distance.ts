import { Client, TravelMode } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export interface DistanceResult {
  distanceKm: number;
  durationMinutes: number;
  distanceText: string;
  durationText: string;
  alternatives?: RouteAlternative[];
}

export interface RouteAlternative {
  distanceKm: number;
  durationMinutes: number;
  distanceText: string;
  durationText: string;
  summary: string; // Route summary (e.g., "Via Federal Highway")
}

/**
 * Calculate distance and duration between two coordinates using Google Directions API
 * @param origin - Starting coordinates { latitude, longitude }
 * @param destination - Ending coordinates { latitude, longitude }
 * @param mode - Travel mode (driving, walking, bicycling, transit)
 * @param includeAlternatives - Whether to include alternative routes (default: true for driving)
 * @returns Distance and duration information or null if calculation fails
 */
export async function calculateDistance(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  mode: "driving" | "walking" | "bicycling" | "transit" = "driving",
  includeAlternatives: boolean = true
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
        alternatives: includeAlternatives && mode === "driving", // Only for driving mode
        key: apiKey,
      },
    });

    if (response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];

      const result: DistanceResult = {
        distanceKm: leg.distance.value / 1000, // Convert meters to kilometers
        durationMinutes: Math.ceil(leg.duration.value / 60), // Convert seconds to minutes
        distanceText: leg.distance.text, // e.g., "15.2 km"
        durationText: leg.duration.text, // e.g., "25 mins"
      };

      // If there are alternative routes, include them
      if (response.data.routes.length > 1) {
        result.alternatives = response.data.routes.slice(1).map((altRoute) => {
          const altLeg = altRoute.legs[0];
          return {
            distanceKm: altLeg.distance.value / 1000,
            durationMinutes: Math.ceil(altLeg.duration.value / 60),
            distanceText: altLeg.distance.text,
            durationText: altLeg.duration.text,
            summary: altRoute.summary || "Alternative route",
          };
        });
      }

      return result;
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
