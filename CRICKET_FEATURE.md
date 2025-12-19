# Cricket Live Matches Feature

This document describes the comprehensive cricket live matches feature added to the project.

## Overview

The cricket feature provides real-time live match data from all popular cricket leagues worldwide, including:

### International Cricket
- Test Matches
- One Day Internationals (ODIs)
- T20 Internationals

### Major T20 Leagues
- **Indian Premier League (IPL)** - India's premier T20 league
- **Big Bash League (BBL)** - Australia's T20 competition
- **Caribbean Premier League (CPL)** - Caribbean T20 tournament
- **Pakistan Super League (PSL)** - Pakistan's premier T20 league
- **The Hundred** - England's innovative 100-ball competition
- **SA20** - South Africa's premier T20 league
- **ILT20** - International League T20 (UAE)
- **T20 Blast** - England's domestic T20 competition
- **Bangladesh Premier League (BPL)**
- **Lanka Premier League (LPL)**

### Domestic First-Class Cricket
- **County Championship** - England's first-class competition
- **Sheffield Shield** - Australia's premier first-class tournament
- **Ranji Trophy** - India's premier domestic first-class competition
- **Plunket Shield** - New Zealand's first-class competition
- **CSA 4-Day Franchise** - South Africa's first-class cricket

### One-Day Competitions
- **One-Day Cup** - England's List A competition
- **Marsh One-Day Cup** - Australia's domestic one-day competition

## API Endpoints

### 1. General Live Matches API
**Endpoint:** `/api/matches/live`

Returns live matches from all sports including cricket. Now includes expanded cricket league coverage.

**Query Parameters:**
- `sports` - Filter by sports (e.g., `?sports=cricket` or `?sports=football,cricket`)

**Example:**
```bash
GET /api/matches/live?sports=cricket
```

### 2. Dedicated Cricket API
**Endpoint:** `/api/cricket/live`

Specialized endpoint for cricket matches with enhanced cricket-specific data.

**Query Parameters:**
- `league` - Filter by specific league (e.g., `?league=ipl` or `?league=ipl,bbl`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "match-id",
      "sport": "cricket",
      "homeTeam": {
        "id": "team-id",
        "name": "India",
        "logo": "team-logo-url",
        "form": "WWLWW",
        "ranking": 1
      },
      "awayTeam": { /* similar structure */ },
      "homeScore": 245,
      "awayScore": 198,
      "status": "live",
      "startTime": "2025-12-17T10:00:00Z",
      "league": "Indian Premier League",
      "venue": "Melbourne Cricket Ground"
    }
  ],
  "timestamp": "2025-12-17T12:00:00Z",
  "leagues": [
    { "name": "Indian Premier League", "slug": "ind-ipl" },
    { "name": "Big Bash League", "slug": "aus-bbl" },
    /* ... more leagues */
  ]
}
```

## UI Pages

### 1. Main Live Matches Page
**Route:** `/live`

Displays live matches from all sports with a filter for cricket.

**Features:**
- Filter by sport (All, Football, Basketball, Cricket)
- Auto-refresh every 10 seconds
- Live match indicators
- Score predictions

### 2. Cricket-Only Page
**Route:** `/cricket`

Dedicated page showing only cricket matches, organized by league.

**Features:**
- Shows all live cricket matches grouped by league
- Auto-refresh every 15 seconds
- Coverage information
- League-wise organization
- Match statistics

## Data Fetching

### Caching Strategy
- Live matches are cached for **10-15 seconds** to reduce API calls
- Uses server-side caching with Redis (if configured)
- Automatic cache invalidation on TTL expiry

### Data Sources
All cricket data is fetched from ESPN's Cricket Scoreboard API:
```
https://site.api.espn.com/apis/site/v2/sports/cricket/{league-slug}/scoreboard
```

### League Slugs Reference
| League | Slug | Priority |
|--------|------|----------|
| International Cricket | `int` | 1 |
| Indian Premier League | `ind-ipl` | 1 |
| Big Bash League | `aus-bbl` | 1 |
| Caribbean Premier League | `caribbean-cpl` | 2 |
| Pakistan Super League | `pak-psl` | 2 |
| The Hundred | `eng-hundred` | 2 |
| SA20 | `sa-t20` | 2 |
| ILT20 | `uae-ipl` | 2 |
| T20 Blast | `eng-t20blast` | 3 |
| County Championship | `eng-county` | 3 |
| Sheffield Shield | `aus-sheff` | 3 |
| Ranji Trophy | `ind-ranji` | 3 |

## Features

### Real-Time Updates
- Matches update automatically every 10-15 seconds
- Live score indicators
- Current match status (live/upcoming/finished)

### Smart Filtering
- Filter by league
- Filter by match status
- Priority-based sorting (major leagues first)

### Cricket-Specific Data
- Runs and wickets
- Over information
- Team rankings
- Recent form

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts
- Touch-optimized controls

## Usage Examples

### Fetch All Live Cricket Matches
```javascript
const response = await fetch('/api/cricket/live');
const data = await response.json();
console.log(data.data); // Array of live cricket matches
```

### Fetch IPL Matches Only
```javascript
const response = await fetch('/api/cricket/live?league=ipl');
const data = await response.json();
```

### Fetch Multiple Leagues
```javascript
const response = await fetch('/api/cricket/live?league=ipl,bbl,psl');
const data = await response.json();
```

## Navigation

A new "🏏 Cricket" link has been added to the main navigation menu, providing quick access to the cricket-only page.

## Performance

- **Parallel Fetching**: All leagues are fetched simultaneously for faster response
- **Caching**: Short-term caching reduces external API calls
- **Error Handling**: Graceful degradation if a league's API fails
- **Timeout Protection**: 10-second timeout prevents hanging requests

## Future Enhancements

Potential improvements:
1. Ball-by-ball commentary
2. Player statistics
3. Match highlights
4. Historical match data
5. Push notifications for important moments
6. Live match scorecard details
7. Team comparison analytics

## Environment Variables

Optional configuration:
```env
# Cache TTL in seconds (default: 10 for live matches)
CACHE_TTL_LIVE=10

# Base path for API calls
NEXT_PUBLIC_BASE_PATH=http://localhost:3000
```

## Testing

To test the cricket feature:

1. Start the development server:
```bash
npm run dev
```

2. Navigate to:
   - `/live` - See all live matches including cricket
   - `/cricket` - See cricket-only live matches
   - `/api/cricket/live` - Test the API endpoint directly

3. The API will fetch real-time data from ESPN Cricket API

## Troubleshooting

### No matches showing
- Check if there are actually live cricket matches happening
- Verify internet connectivity
- Check console for API errors
- Verify ESPN Cricket API is accessible

### Slow loading
- Reduce number of leagues being fetched
- Increase cache TTL
- Check network conditions

### Missing data
- Some leagues may have limited data during off-season
- API structure may change - check ESPN's documentation
- Verify league slugs are correct

## Credits

Data provided by ESPN Cricket API. This feature respects API rate limits and implements responsible caching strategies.
