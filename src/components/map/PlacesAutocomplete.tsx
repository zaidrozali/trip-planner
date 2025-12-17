"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Search for a location...",
  required = false,
  className = "",
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is loaded
    if (typeof google !== "undefined" && google.maps && google.maps.places) {
      setIsLoaded(true);
    } else {
      // Wait for Google Maps to load
      const checkGoogleMaps = setInterval(() => {
        if (typeof google !== "undefined" && google.maps && google.maps.places) {
          setIsLoaded(true);
          clearInterval(checkGoogleMaps);
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      fields: ["formatted_address", "geometry", "name"],
    });

    // Listen for place selection
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();

      if (place && place.geometry && place.geometry.location) {
        const address = place.formatted_address || place.name || "";
        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();

        onChange(address);

        if (onPlaceSelected) {
          onPlaceSelected({
            address,
            latitude,
            longitude,
          });
        }
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange, onPlaceSelected]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete="off"
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <MapPin className="w-4 h-4 text-gray-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}
