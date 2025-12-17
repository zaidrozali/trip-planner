import { Map as MapIcon } from "lucide-react";

interface MapPlaceholderProps {
  message: string;
}

export function MapPlaceholder({ message }: MapPlaceholderProps) {
  return (
    <div className="w-full lg:w-80 flex-shrink-0">
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 h-[400px] lg:h-[600px] flex items-center justify-center">
        <div className="text-center p-6 max-w-xs">
          <MapIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
}
