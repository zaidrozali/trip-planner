# Trip Planner

A comprehensive trip planning application powered by AI and Google Maps integration. Plan your perfect trip with intelligent route optimization, distance calculation, and AI-powered travel recommendations.

## Features

### AI Travel Assistant
Get personalized travel recommendations powered by **Google Gemini 2.5 Flash**. The AI assistant provides:
- Context-aware suggestions based on your current itinerary
- Best places to visit recommendations
- Local insights and tips
- Activity suggestions tailored to your trip

### Interactive Map Integration
Visualize your entire trip with real-time map updates:
- **Starting Location Marker**: Set your hotel or starting point with a distinctive house icon
- **Activity Markers**: Color-coded numbered markers for each activity
- **Route Visualization**: See actual road routes from starting point to all activities
- **Auto-centering**: Map automatically adjusts to show all your locations
- **Info Windows**: Click markers to view activity details, time, cost, and location

### Smart Distance Calculation
Accurate travel planning with Google Maps Directions API:
- **Automatic Distance Calculation**: Real-time distance and travel time between activities
- **Multiple Transport Modes**: Walking, driving, Grab/taxi, bus, train support
- **Route Alternatives**: Compare different routes and select the best one
- **Starting Point to First Activity**: Calculate distance from your hotel/home to first destination
- **Recalculate Button**: Manually refresh distances when needed

### Route Optimization
Find the best route for your journey:
- **Alternative Routes Modal**: View up to 3 different routes with distance and time comparisons
- **Route Summaries**: See route descriptions (e.g., "Via Federal Highway")
- **One-Click Selection**: Choose alternative routes to optimize your trip
- **Smart Defaults**: System automatically selects optimal routes

### Trip Management
Complete trip planning features:
- **Multi-Day Itineraries**: Organize activities across multiple days
- **Activity Timeline**: Schedule activities with start time and duration
- **Cost Tracking**: Monitor expenses with automatic totals
- **Location Autocomplete**: Google Places integration for easy location selection
- **Drag & Drop** (Coming Soon): Reorder activities easily

### Travel Statistics
Get instant overview of your trip:
- **Total Distance**: See cumulative distance across all days
- **Total Cost**: Automatic calculation of all expenses
- **Activity Count**: Track number of planned activities
- **Day Count**: Trip duration at a glance

### Starting Location Tracking
Set and visualize your daily starting point:
- **Daily Starting Point**: Define where each day begins (hotel, home, Airbnb)
- **Transport Selection**: Choose how you'll get to your first activity
- **Visual Indicator**: Starting point shown on map with special marker
- **Distance Display**: See distance and time from starting point

### Activity Customization
Flexible activity planning:
- **Custom Icons**: Choose from multiple activity icons
- **Color Coding**: Assign colors to different activity types
- **Time & Duration**: Set start time and how long each activity takes
- **Cost Tracking**: Record estimated or actual costs
- **Location Details**: Full address with coordinates

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **React Google Maps API** - Interactive map integration
- **Lucide Icons** - Modern icon library

### Backend
- **Next.js Server Actions** - Type-safe server functions
- **Prisma ORM** - Database management
- **PostgreSQL** - Production database (Supabase)
- **NextAuth.js** - Authentication

### AI & APIs
- **Google Generative AI (Gemini 2.5 Flash)** - AI travel assistant
- **Google Maps Directions API** - Route calculation and alternatives
- **Google Maps Geocoding API** - Address to coordinates conversion
- **Google Places API** - Location autocomplete

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Supabase account)
- Google Cloud Platform account with APIs enabled
- Google Generative AI API key

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://..."

# Google APIs
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Required Google Cloud APIs
Enable the following APIs in your Google Cloud Console:
- Maps JavaScript API
- Directions API
- Geocoding API
- Places API

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zaidrozali/trip-planner.git
cd trip-planner
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Creating a Trip
1. Click "Create New Trip"
2. Enter trip details (name, location, dates)
3. Trip dashboard will open

### Adding Activities
1. Click "Add Activity" button
2. Fill in activity details:
   - Title and description
   - Location (use autocomplete for accuracy)
   - Time and duration
   - Cost estimate
   - Choose icon and color
3. Select transport type to next activity
4. Save activity

### Setting Starting Location
1. Click "Set starting location" card
2. Enter your hotel/home address
3. Choose transport type to first activity
4. Distance will be calculated automatically

### Calculating Distances
- Distances calculate automatically when adding/editing activities
- Click "Calculate Distances" button to recalculate all routes
- Click the route comparison icon to view alternative routes

### Using AI Assistant
1. Scroll to the AI Travel Assistant section
2. Ask questions like:
   - "Best places to visit in [destination]"
   - "What should I do on Day 2?"
   - "Recommend activities near [location]"
3. Get context-aware suggestions based on your trip

### Viewing Routes on Map
- Map shows all activities with numbered markers
- Starting point marked with house icon
- Routes displayed between consecutive activities
- Click markers to view activity details
- Map auto-adjusts to show all locations

## Key Features in Detail

### Route Alternatives Feature
When you have activities with driving transport:
- Click the comparison icon next to travel info
- View up to 3 alternative routes
- See distance, duration, and route summary for each
- Current route highlighted in blue
- Alternative routes shown with comparison info
- Click any route to select it

### Automatic Distance Updates
The system automatically calculates distances when:
- Adding a new activity
- Editing activity location
- Changing transport type
- Setting/updating starting location
- All calculations use Google Directions API for accuracy

### Map Intelligence
The map automatically:
- Centers on your activities
- Adjusts zoom level for single or multiple markers
- Shows actual road routes (not straight lines)
- Updates when locations change
- Displays transport-specific routes (walking paths, driving routes, transit)

## Database Schema

### Main Tables
- **Trip**: Trip information and metadata
- **Day**: Individual days within a trip
- **Activity**: Scheduled activities with location and timing
- **Checklist**: Packing lists and todo items
- **User**: User accounts and authentication

## API Rate Limits

Be aware of Google API quotas:
- **Directions API**: 2,500 free requests/day
- **Geocoding API**: 40,000 free requests/day
- **Places API**: $200 free credit/month
- **Gemini AI**: Rate limits vary by tier

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Roadmap

Upcoming features:
- [ ] Drag & drop activity reordering
- [ ] Share trips with others
- [ ] Export itinerary to PDF
- [ ] Weather integration
- [ ] Budget recommendations
- [ ] Collaborative planning
- [ ] Mobile app version
- [ ] Offline mode
- [ ] Flight and hotel booking integration

## Acknowledgments

- Built with Next.js and React
- Powered by Google Maps Platform
- AI capabilities by Google Gemini
- UI components from shadcn/ui
- Hosted on Vercel
