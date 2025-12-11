export type SportType = 'football' | 'basketball' | 'cricket';

export interface Team {
  id: string;
  name: string;
  logo?: string;
  form?: string; // e.g., "WWDLW"
  ranking?: number;
  recentGoals?: number;
  recentConceded?: number;
}

export interface Match {
  id: string;
  sport: SportType;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  status: 'live' | 'upcoming' | 'finished';
  startTime: string;
  league: string;
  venue?: string;
  minute?: number; // For live matches
}

export interface Prediction {
  matchId: string;
  homeWinProbability: number;
  awayWinProbability: number;
  drawProbability?: number; // For football
  confidence: 'high' | 'medium' | 'low';
  analysis: string;
  factors: {
    form: number;
    headToHead: number;
    homeAdvantage: number;
  };
}
