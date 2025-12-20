import { redirect } from "next/navigation";
import { getUser } from "@/actions/auth";
import { getTrips } from "@/actions/trips";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TripCard } from "@/components/trip/TripCard";

export default async function TripsPage() {
    const user = await getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const trips = await getTrips();

    return (
        <main className="min-h-screen bg-[#f0fdfa] dark:bg-[#042f2e] p-4 md:p-6 lg:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Trips</h1>
                        <p className="text-gray-500 dark:text-gray-400">{trips.length} trips planned</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <UserMenu user={user} />
                    </div>
                </div>

                {/* Trip Grid */}
                <div className="grid gap-4">
                    {trips.length === 0 ? (
                        <div className="bg-white dark:bg-[#134e4a] rounded-3xl p-12 text-center border border-gray-100 dark:border-teal-800">
                            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                                🗺️
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                No trips yet
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Start planning your first adventure!
                            </p>
                            <Link
                                href="/trip/new"
                                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium shadow-md transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Create Trip
                            </Link>
                        </div>
                    ) : (
                        <>
                            {trips.map((trip) => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}

                            {/* Add New Trip Card */}
                            <Link
                                href="/trip/new"
                                className="bg-white/50 dark:bg-teal-900/20 rounded-2xl p-5 border-2 border-dashed border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all flex items-center justify-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">Create New Trip</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
