# Google Maps Setup Guide

This guide will help you set up Google Maps integration for the Trip Planner app.

## Prerequisites

- A Google Cloud account (free tier available)
- Credit card for Google Cloud billing (required even for free tier)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Trip Planner")
4. Click "Create"

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable the following APIs:
   - **Maps JavaScript API** (for displaying maps)
   - **Geocoding API** (for converting addresses to coordinates)
3. Click "Enable" for each API

## Step 3: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API key"
3. Copy the generated API key
4. Click "Edit API key" to add restrictions

### Configure API Key Restrictions

#### For Client-Side Key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY):
1. **Application restrictions**: Select "HTTP referrers"
2. Add your domains:
   - `http://localhost:3000/*` (for development)
   - `https://yourdomain.com/*` (for production)
3. **API restrictions**: Select "Restrict key"
4. Select: Maps JavaScript API
5. Click "Save"

#### For Server-Side Key (GOOGLE_MAPS_API_KEY):
1. Create a second API key
2. **Application restrictions**: Select "IP addresses"
3. Add your server IP addresses
4. **API restrictions**: Select "Restrict key"
5. Select: Geocoding API
6. Click "Save"

## Step 4: Set Up Billing

1. Go to "Billing" in Google Cloud Console
2. Link a payment method
3. Set up budget alerts (recommended):
   - Go to "Budgets & alerts"
   - Create budget (e.g., $10/month)
   - Set alert thresholds at 50%, 90%, 100%

### Free Tier Limits (as of 2024):
- **Maps JavaScript API**: 28,000 map loads/month
- **Geocoding API**: 40,000 requests/month

This is sufficient for most small to medium applications.

## Step 5: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual API keys:

```env
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_client_side_api_key_here
GOOGLE_MAPS_API_KEY=your_server_side_api_key_here
```

**Important**: Never commit `.env.local` to version control!

## Step 6: Restart Development Server

After adding the API keys, restart your development server:

```bash
npm run dev
```

## Step 7: Migrate Existing Data (Optional)

If you have existing trips and activities with location text but no coordinates, run the migration script:

```bash
npx tsx scripts/geocode-existing-data.ts
```

This will:
- Find all activities and trips with locations but no coordinates
- Geocode them using the Google Geocoding API
- Update the database with latitude/longitude values
- Add a 100ms delay between requests to respect rate limits

**Note**: Monitor the output for any failed geocodes.

## Testing the Integration

1. Navigate to your app at `http://localhost:3000`
2. Create a new trip with a location (e.g., "Cameron Highlands")
3. Add activities with specific locations (e.g., "Boh Tea Centre")
4. View the trip dashboard - you should see:
   - Activity markers on the map
   - Click markers to see activity details
   - Map auto-fits to show all activities

## Troubleshooting

### Map Not Displaying

**Error**: "For development purposes only" watermark on map
- **Cause**: API key restrictions too strict for localhost
- **Solution**: Add `http://localhost:3000/*` to HTTP referrers

**Error**: Map shows gray area
- **Cause**: API key not set or invalid
- **Solution**: Check `.env.local` and verify API key is correct

### Geocoding Not Working

**Error**: Activities have locations but no markers on map
- **Cause**: Server-side API key not set or geocoding failed
- **Solution**:
  1. Check `GOOGLE_MAPS_API_KEY` in `.env.local`
  2. Run migration script: `npx tsx scripts/geocode-existing-data.ts`
  3. Check server logs for geocoding errors

**Error**: "ZERO_RESULTS" in geocoding
- **Cause**: Location name too vague or doesn't exist
- **Solution**: Use more specific location names (e.g., "Boh Tea Centre, Cameron Highlands, Malaysia")

### Rate Limiting

**Error**: Geocoding fails after many requests
- **Cause**: Exceeded free tier quota
- **Solution**:
  1. Check quota usage in Google Cloud Console
  2. Increase budget if needed
  3. Add more delay in migration script

## Cost Optimization Tips

1. **Cache geocoding results**: Coordinates are stored in the database - no repeated API calls
2. **Batch operations carefully**: Migration script includes rate limiting
3. **Monitor usage**: Set up billing alerts in Google Cloud Console
4. **Use specific locations**: Helps geocoding succeed on first try

## Security Best Practices

1. ✅ Use separate API keys for client and server
2. ✅ Add HTTP referrer restrictions for client key
3. ✅ Add IP address restrictions for server key
4. ✅ Never commit `.env.local` to git
5. ✅ Rotate API keys if exposed
6. ✅ Set up budget alerts

## Need Help?

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding)
- [Google Cloud Console](https://console.cloud.google.com/)

## Feature Roadmap

Future enhancements (not yet implemented):
- Place autocomplete search when adding activities
- Route directions between activities
- Distance and travel time calculations
- Street View integration
- Export map as image
