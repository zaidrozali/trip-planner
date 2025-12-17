import { Button } from "@/components/ui/button"
import { Calendar, Download, MapPin, Share2, Users } from "lucide-react"
import { Trip, User } from "@prisma/client"

interface TripHeaderProps {
    trip: Trip & { owner: User }
}

export default function TripHeader({ trip }: TripHeaderProps) {
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate total spent (would need activities data in real implementation)
    const spent = 500; // Placeholder
    const budgetPercent = trip.budget > 0 ? Math.min((spent / trip.budget) * 100, 100) : 0;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="space-y-6 pb-6 border-b border-gray-100 dark:border-gray-800 transition-colors">
            {/* Top Row: Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-200 dark:shadow-teal-900/20">
                        {trip.coverEmoji}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                            {trip.title}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{trip.location || "No location set"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 mr-2">
                        <div className="w-8 h-8 rounded-full bg-teal-200 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-teal-700">
                            {trip.owner.name?.[0] || trip.owner.email[0].toUpperCase()}
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="hidden sm:flex rounded-full dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Users className="w-4 h-4 mr-2" />
                        Invite
                    </Button>
                    <Button variant="outline" size="sm" className="hidden sm:flex rounded-full dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full dark:text-gray-300 dark:hover:bg-gray-800">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Bottom Row: Stats & Budget */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-transparent dark:border-gray-700">
                        <Calendar className="w-4 h-4 text-teal-500" />
                        <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span>{dayCount} Days</span>
                    </div>
                </div>

                <div className="w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-500 dark:text-gray-400">Budget Progress</span>
                        <span className="text-gray-900 dark:text-gray-200">
                            RM {spent.toFixed(2)} / RM {trip.budget.toFixed(2)}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${budgetPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
