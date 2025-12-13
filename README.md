# SportPredict - AI-Powered Sports Prediction Platform

A stunning, modern web application that provides live sports scores and AI-powered match predictions for football and basketball.

## ✨ Features

- 🎯 **AI-Powered Predictions** - Statistical analysis of team form, rankings, and historical data
- ⚡ **Live Matches** - Real-time scores with auto-refresh functionality
- 📅 **Upcoming Matches** - Complete schedule with detailed predictions
- 🎨 **Beautiful UI** - Modern glassmorphism design with smooth animations
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- 🏀 **Multi-Sport** - Supports both football and basketball
- 🚀 **High Performance** - Optimized for fast loading and scalability

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Date Handling:** date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Test the new endpoints

After starting the dev server, you can test the team endpoints (they return mock data unless configured via env templates):

```bash
curl "http://localhost:3000/api/external/espn/team/chelsea/recent?sport=football"
curl "http://localhost:3000/api/external/espn/team/chelsea/injuries?sport=football"
curl "http://localhost:3000/api/external/espn/team/chelsea/upcoming?sport=football"
```

Open the team page:

```
http://localhost:3000/team/football/chelsea

### Server-side Cache & Refresh

This app now ships with a simple in-memory cache used by the team endpoints and the live matches feed to reduce requests to external APIs. Configuration options (via `.env.local`):

- `CACHE_TTL_RECENT` — recent matches TTL in seconds (default: 300)
- `CACHE_TTL_INJURIES` — injuries TTL in seconds (default: 300)
- `CACHE_TTL_UPCOMING` — team upcoming TTL in seconds (default: 60)
- `CACHE_TTL_LIVE` — live matches TTL in seconds (default: 10)

### Redis (optional, multi-instance)

You can enable Redis-backed caching for multi-instance deployments. Set the following environment variables in `.env.local`:

- `USE_REDIS=true` — enable Redis adapter
- `REDIS_URL` — full Redis connection string (e.g. `redis://:password@redis-host:6379`)

If `USE_REDIS` or `REDIS_URL` is present, the app will attempt to use Redis for `get`, `set`, `fetchOrSet`, and `del`. Make sure you have `ioredis` installed (already included in `package.json`).

Example:

```
USE_REDIS=true
REDIS_URL=redis://127.0.0.1:6379
```

Note: the in-memory cache remains the fallback if Redis is unavailable.

### Admin endpoints & scheduled warming

- **Clear cache:** `POST /api/admin/cache/clear` — requires header `x-admin-token: <ADMIN_TOKEN>`; accept JSON body `{ "pattern": "team:*" }` to clear matching keys.
- **Redis health:** `GET /api/admin/redis/health` — returns `available: true|false` and ping status.
- **Scheduled warming:** Controlled via env vars:
   Examples:

   ```
   # Clear all cache entries
   curl -X POST -H "x-admin-token: devtoken" -H "Content-Type: application/json" -d '{"pattern":"*"}' http://localhost:3000/api/admin/cache/clear

   # Warm caches immediately
   curl -X POST -H "x-admin-token: devtoken" http://localhost:3000/api/admin/cache/warm

   # Check Redis health
   curl http://localhost:3000/api/admin/redis/health
   ```
   - `ENABLE_CACHE_WARM=true` — enable scheduled warming job
   - `CACHE_WARM_CRON` — cron schedule expression (default `*/10 * * * *` = every 10 minutes)

Enable admin token in `.env.local`:

```
ADMIN_TOKEN=your_secret_token
ENABLE_CACHE_WARM=true
CACHE_WARM_CRON=*/10 * * * *
```

Security note: don't expose admin endpoints publicly — use network restrictions or authentication.

The cache is in-memory — suitable for single-instance deployments. For production or multi-instance setups, use Redis or another shared cache.

You can warm server caches for teams listed in the upcoming match feed using the included script. Make sure your dev server is running (e.g., `npm run dev`) and run:

```bash
npm run refresh-cache
```

```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
sports-prediction-platform/
├── app/
│   ├── api/              # API routes for matches and predictions
│   ├── live/             # Live matches page
│   ├── upcoming/         # Upcoming matches page
│   ├── layout.tsx        # Root layout with navigation
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles and animations
├── components/
│   ├── MatchCard.tsx     # Match display component
│   ├── Navigation.tsx    # Header navigation
│   ├── LiveIndicator.tsx # Animated live badge
│   └── PredictionBar.tsx # Win probability visualization
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   └── predictor.ts      # Prediction algorithm
└── public/               # Static assets
```

## 🎨 Design Features

- **Glassmorphism Effects** - Frosted glass card designs
- **Gradient Animations** - Dynamic background gradients
- **Smooth Transitions** - Framer Motion animations
- **Custom Scrollbar** - Themed scrollbar design
- **Glow Effects** - Neon-style glowing elements
- **Responsive Grid** - Adaptive layouts for all screen sizes

## 🔮 Prediction Algorithm

The AI prediction system analyzes:
- **Team Form** - Recent match results (W/D/L)
- **Goal/Point Statistics** - Recent scoring records
- **Home Advantage** - 8% boost for home teams
- **Rankings** - League position impact
- **Historical Performance** - Goal differential analysis

Predictions are categorized by confidence:
- **High** (>30% probability difference)
- **Medium** (15-30% probability difference)
- **Low** (<15% probability difference)

## 🔌 API Integration

Currently using mock data. To integrate real sports data:

1. Sign up for a sports API (recommended: API-Football, API-Basketball)
2. Add your API key to `.env.local`:
   ```
   SPORTS_API_KEY=your_api_key_here
   ```
3. Update the API routes in `app/api/matches/` to fetch real data

### ESPN Integration & Webscraping

If you want to fetch team recent matches and injuries from ESPN or another public feed, configure the following environment variables. The app will try to use the configured templates and fall back to mock data if no external endpoint is configured.

- `ESPN_TEAM_RECENT_TEMPLATE` — A template for a recent matches endpoint, example: `https://site.api.espn.com/apis/site/v2/sports/{sport}/teams/{teamId}/schedule`
- `ESPN_TEAM_INJURIES_TEMPLATE` — A template for an injuries endpoint, example: `https://site.api.espn.com/apis/site/v2/sports/{sport}/teams/{teamId}/injuries`
- `ESPN_TEAM_INJURIES_TEMPLATE` — A template for an injuries endpoint, example: `https://site.api.espn.com/apis/site/v2/sports/{sport}/teams/{teamId}/injuries`
- `ESPNCRICINFO_TEAM_TEMPLATE` — (optional) template for ESPNcricinfo team pages, example: `https://www.espncricinfo.com/team/{slug}-{teamId}`
- `NEXT_PUBLIC_BASE_PATH` — (optional) API base path if your app is served under a path prefix
- `ESPN_TEAM_RECENT_TEMPLATE` — A template for a recent matches endpoint, example: `https://site.api.espn.com/apis/site/v2/sports/{sport}/teams/{teamId}/schedule`
- `ESPN_TEAM_INJURIES_TEMPLATE` — A template for an injuries endpoint, example: `https://site.api.espn.com/apis/site/v2/sports/{sport}/teams/{teamId}/injuries`
- `ESPN_TEAM_UPCOMING_TEMPLATE` — (optional) template for team-specific upcoming matches
- `NEXT_PUBLIC_BASE_PATH` — (optional) API base path if your app is served under a path prefix

Replace `{sport}` and `{teamId}` in the templates with values like `football`, `basketball`, `cricket`, and the team's id used by ESPN (or any other API). If the API you choose returns data in a different shape, implement a small adapter in the corresponding server route to normalize the payload to the format used by the frontend.

Example `.env.local`:

```
ESPN_TEAM_RECENT_TEMPLATE=https://site.api.espn.com/apis/site/v2/sports/{sport}/teams/{teamId}/schedule
ESPN_TEAM_INJURIES_TEMPLATE=https://site.api.espn.com/apis/site/v2/sports/{sport}/teams/{teamId}/injuries
NEXT_PUBLIC_BASE_PATH=
```

## 🎯 Future Enhancements

- User authentication and favorites
- Historical match data and statistics
- Live notifications for match events
- Social sharing features
- Betting odds integration
- Mobile app version
- Multiple language support

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
