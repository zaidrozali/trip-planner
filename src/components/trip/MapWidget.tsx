import { Button } from "@/components/ui/button";
import { Maximize2, Map as MapIcon } from "lucide-react";

export default function MapWidget() {
    return (
        <div className="w-full lg:w-80 flex-shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 relative h-[400px] lg:h-[600px] xl:h-[calc(100vh-300px)] min-h-[400px]">
                {/* Map Placeholder Graphic */}
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=4.4721,101.3788&zoom=13&size=600x800&scale=2&maptype=terrain&key=YOUR_API_KEY_HERE')] bg-cover bg-center grayscale opacity-30 dark:opacity-20 hover:grayscale-0 hover:opacity-80 transition-all duration-700 dark:invert-[.1]"></div>

                {/* Fallback pattern if image fails to load or for style */}
                <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-900/50 flex items-center justify-center z-0">
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <MapIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Interactive Map View</p>
                    </div>
                </div>

                {/* Functional Overlay */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <Button size="icon" variant="secondary" className="bg-white/90 dark:bg-gray-800/90 shadow-md w-8 h-8 rounded-lg text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 backdrop-blur-sm">
                        <Maximize2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Current Location Pin Mockup */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-10">
                    <div className="relative">
                        <div className="w-4 h-4 bg-teal-600 rounded-full border-2 border-white dark:border-gray-900 shadow-lg animate-bounce"></div>
                        <div className="w-12 h-12 bg-teal-500/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
                    </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 dark:border-gray-700/50 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400">
                            <MapIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-800 dark:text-gray-100">Campsite Loc.</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">2km from Center</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
