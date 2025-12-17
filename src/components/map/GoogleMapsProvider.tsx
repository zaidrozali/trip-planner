"use client";

import { LoadScript } from "@react-google-maps/api";
import { ReactNode } from "react";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
    return <>{children}</>;
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      loadingElement={
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-gray-500">Loading Maps...</div>
        </div>
      }
    >
      {children}
    </LoadScript>
  );
}
