import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "../src/lib/geocoding";

const db = new PrismaClient();

async function geocodeExistingData() {
  console.log("Starting geocoding of existing data...\n");

  try {
    // Geocode Activities
    console.log("📍 Finding activities with locations but no coordinates...");
    const activities = await db.activity.findMany({
      where: {
        location: { not: null },
        latitude: null,
      },
      select: {
        id: true,
        location: true,
      },
    });

    console.log(`Found ${activities.length} activities to geocode.\n`);

    let activitySuccessCount = 0;
    let activityFailCount = 0;

    for (const activity of activities) {
      if (!activity.location) continue;

      console.log(`Geocoding activity: "${activity.location}"...`);
      const coords = await geocodeAddress(activity.location);

      if (coords) {
        await db.activity.update({
          where: { id: activity.id },
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        });
        console.log(
          `✓ Success: ${coords.latitude}, ${coords.longitude}`
        );
        activitySuccessCount++;
      } else {
        console.log(`✗ Failed to geocode: "${activity.location}"`);
        activityFailCount++;
      }

      // Rate limiting delay (100ms between requests)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `\nActivity geocoding complete: ${activitySuccessCount} succeeded, ${activityFailCount} failed.\n`
    );

    // Geocode Trips
    console.log("📍 Finding trips with locations but no coordinates...");
    const trips = await db.trip.findMany({
      where: {
        location: { not: null },
        latitude: null,
      },
      select: {
        id: true,
        location: true,
      },
    });

    console.log(`Found ${trips.length} trips to geocode.\n`);

    let tripSuccessCount = 0;
    let tripFailCount = 0;

    for (const trip of trips) {
      if (!trip.location) continue;

      console.log(`Geocoding trip: "${trip.location}"...`);
      const coords = await geocodeAddress(trip.location);

      if (coords) {
        await db.trip.update({
          where: { id: trip.id },
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        });
        console.log(
          `✓ Success: ${coords.latitude}, ${coords.longitude}`
        );
        tripSuccessCount++;
      } else {
        console.log(`✗ Failed to geocode: "${trip.location}"`);
        tripFailCount++;
      }

      // Rate limiting delay (100ms between requests)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `\nTrip geocoding complete: ${tripSuccessCount} succeeded, ${tripFailCount} failed.\n`
    );

    console.log("=====================================");
    console.log("SUMMARY:");
    console.log(`Activities: ${activitySuccessCount}/${activities.length} geocoded`);
    console.log(`Trips: ${tripSuccessCount}/${trips.length} geocoded`);
    console.log("=====================================");
  } catch (error) {
    console.error("Error during geocoding:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Check for required environment variables
if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error(
    "❌ Error: GOOGLE_MAPS_API_KEY environment variable is not set."
  );
  console.error("Please add it to your .env.local file and try again.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

// Run the migration
geocodeExistingData()
  .then(() => {
    console.log("\n✅ Geocoding migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
