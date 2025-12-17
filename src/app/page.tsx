import { redirect } from "next/navigation";
import { getUser } from "@/actions/auth";
import { getTrips } from "@/actions/trips";
import TripHeader from "@/components/trip/TripHeader";
import TripSidebar from "@/components/trip/TripSidebar";
import ActivityFeed from "@/components/trip/ActivityFeed";
import MapWidget from "@/components/trip/MapWidget";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function Home() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const trips = await getTrips();
  const currentTrip = trips[0]; // Show first trip or create new

  return (
    <main className="min-h-screen bg-[#f0fdfa] dark:bg-[#042f2e] p-4 md:p-6 lg:p-8 pb-20 font-sans selection:bg-teal-100 selection:text-teal-900 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto bg-white dark:bg-[#134e4a] rounded-[2.5rem] shadow-2xl shadow-teal-100/50 dark:shadow-teal-900/50 min-h-[800px] overflow-hidden border border-white/50 dark:border-teal-800/50 relative transition-colors duration-300">

        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-teal-50/50 to-transparent dark:from-teal-900/20 rounded-bl-full -z-0 pointer-events-none opacity-60"></div>

        <div className="relative z-10 p-6 md:p-8 lg:p-10 space-y-8">
          {/* Top bar with theme toggle and user menu */}
          <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>

          {currentTrip ? (
            <>
              <TripHeader trip={currentTrip} />

              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <TripSidebar trip={currentTrip} />
                <ActivityFeed trip={currentTrip} selectedDay={1} />
                <MapWidget />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-lg shadow-teal-200 dark:shadow-teal-900/20">
                🗺️
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No trips yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                Start planning your first adventure! Create a trip to get started with your itinerary.
              </p>
              <Link
                href="/trip/new"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-teal-200 dark:shadow-teal-900/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Trip
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
