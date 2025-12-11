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
