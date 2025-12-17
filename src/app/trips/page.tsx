import { redirect } from "next/navigation";
import { getUser } from "@/actions/auth";
import { getTrips } from "@/actions/trips";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import Link from "next/link";
import { Plus, MapPin, Calendar, ChevronRight, Wallet } from "lucide-react";

export default async function TripsPage() {
    const user = await getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const trips = await getTrips();

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

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
                            {trips.map((trip) => {
                                const totalCost = trip.days.reduce((sum, day) =>
                                    sum + day.activities.reduce((daySum, a) => daySum + a.cost, 0), 0
                                );
                                const activityCount = trip.days.reduce((sum, d) => sum + d.activities.length, 0);

                                return (
                                    <Link
                                        key={trip.id}
                                        href={`/?trip=${trip.id}`}
                                        className="bg-white dark:bg-[#134e4a] rounded-2xl p-5 border border-gray-100 dark:border-teal-800 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-700 transition-all group flex items-center gap-4"
                                    >
                                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                                            {trip.coverEmoji}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                                                {trip.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {trip.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {trip.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0 hidden sm:block">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {trip.days.length} days
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {activityCount} activities
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0 hidden md:block">
                                            <div className="flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400">
                                                <Wallet className="w-3 h-3" />
                                                RM {totalCost.toFixed(0)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                of RM {trip.budget.toFixed(0)}
                                            </div>
                                        </div>

                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                                    </Link>
                                );
                            })}

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
