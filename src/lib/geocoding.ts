import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Geocode a single address to get coordinates
 * @param address - The address to geocode
 * @returns Coordinates object or null if geocoding fails
 */
export async function geocodeAddress(
  address: string
): Promise<Coordinates | null> {
  if (!address?.trim()) {
    return null;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY environment variable is not set");
    return null;
  }

  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: apiKey,
      },
    });

    if (response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return {
        latitude: lat,
        longitude: lng,
      };
    }

    console.warn(`No geocoding results found for address: "${address}"`);
    return null;
  } catch (error) {
    console.error(`Geocoding error for address "${address}":`, error);
    return null;
  }
}

/**
 * Batch geocode multiple addresses with rate limiting
 * @param addresses - Array of addresses to geocode
 * @param delayMs - Delay between requests in milliseconds (default: 100ms)
 * @returns Map of address to coordinates
 */
export async function geocodeAddresses(
  addresses: string[],
  delayMs: number = 100
): Promise<Map<string, Coordinates>> {
  const results = new Map<string, Coordinates>();

  for (const address of addresses) {
    if (!address?.trim()) continue;

    const coords = await geocodeAddress(address);
    if (coords) {
      results.set(address, coords);
    }

    // Rate limiting delay
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
