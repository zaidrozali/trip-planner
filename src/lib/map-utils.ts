/**
 * Convert activity color names to hex codes for map markers
 * @param color - Activity color name
 * @returns Hex color code
 */
export function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    orange: "#f97316",
    teal: "#0d9488",
    pink: "#ec4899",
    amber: "#f59e0b",
    green: "#22c55e",
    blue: "#3b82f6",
    purple: "#a855f7",
    red: "#ef4444",
  };
  return colorMap[color] || colorMap.orange;
}

/**
 * Get default map center coordinates for common locations
 * @param location - Location name (optional)
 * @returns Coordinates for the location or default Malaysia center
 */
export function getDefaultMapCenter(location?: string): {
  lat: number;
  lng: number;
} {
  // Default centers for common Malaysian locations
  const defaults: Record<string, { lat: number; lng: number }> = {
    "Cameron Highlands": { lat: 4.4721, lng: 101.3788 },
    "Kuala Lumpur": { lat: 3.139, lng: 101.6869 },
    Penang: { lat: 5.4141, lng: 100.3288 },
    Malacca: { lat: 2.1896, lng: 102.2501 },
    "Langkawi": { lat: 6.3501, lng: 99.8 },
    "Johor Bahru": { lat: 1.4927, lng: 103.7414 },
    Ipoh: { lat: 4.5975, lng: 101.0901 },
    "Kota Kinabalu": { lat: 5.9804, lng: 116.0735 },
    Kuching: { lat: 1.5535, lng: 110.3593 },
  };

  if (location && defaults[location]) {
    return defaults[location];
  }

  // Default to center of Malaysia
  return { lat: 4.2105, lng: 101.9758 };
}
