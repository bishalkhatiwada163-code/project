import { Match, Prediction, Team } from './types';

/**
 * Calculate win probability based on team statistics
 */
export function calculatePrediction(match: Match): Prediction {
  const { homeTeam, awayTeam, sport } = match;

  // Calculate form score (based on recent results)
  const homeFormScore = calculateFormScore(homeTeam.form || '');
  const awayFormScore = calculateFormScore(awayTeam.form || '');

  // Home advantage bonus (typically 5-10% advantage)
  const homeAdvantage = 8;

  // Calculate goal difference impact (for teams with stats)
  const homeGoalDiff = (homeTeam.recentGoals || 0) - (homeTeam.recentConceded || 0);
  const awayGoalDiff = (awayTeam.recentGoals || 0) - (awayTeam.recentConceded || 0);

  // Base probability calculation
  let homeProbability = 50 + (homeFormScore - awayFormScore) * 2 + homeAdvantage;
  homeProbability += (homeGoalDiff - awayGoalDiff) * 1.5;

  // Ranking impact (if available)
  if (homeTeam.ranking && awayTeam.ranking) {
    const rankingDiff = awayTeam.ranking - homeTeam.ranking;
    homeProbability += rankingDiff * 0.5;
  }

  // Normalize probabilities
  homeProbability = Math.max(15, Math.min(85, homeProbability));

  let awayProbability: number;
  let drawProbability: number | undefined;

  if (sport === 'football') {
    // Football has draws
    drawProbability = Math.max(15, Math.min(30, 100 - homeProbability - 10));
    awayProbability = 100 - homeProbability - drawProbability;
  } else {
    // Basketball rarely has draws - only two teams
    drawProbability = undefined;
    awayProbability = 100 - homeProbability;
  }

  // Convert to decimal (0-1) for consistent display
  homeProbability = homeProbability / 100;
  awayProbability = awayProbability / 100;
  if (drawProbability !== undefined) {
    drawProbability = drawProbability / 100;
  }

  // Determine confidence level
  const probabilityDiff = Math.abs(homeProbability - awayProbability);
  let confidence: 'high' | 'medium' | 'low';
  if (probabilityDiff > 0.30) confidence = 'high';
  else if (probabilityDiff > 0.15) confidence = 'medium';
  else confidence = 'low';

  // Generate analysis
  const analysis = generateAnalysis(
    homeTeam,
    awayTeam,
    homeProbability,
    awayProbability,
    sport
  );

  return {
    matchId: match.id,
    homeWinProbability: homeProbability,
    awayWinProbability: awayProbability,
    drawProbability: drawProbability,
    confidence,
    analysis,
    factors: {
      form: (homeFormScore - awayFormScore) / 100,
      headToHead: 0, // Could be enhanced with H2H data
      homeAdvantage: homeAdvantage / 100,
    },
  };
}

/**
 * Calculate form score from recent results string (e.g., "WWDLW")
 * W = Win (3 points), D = Draw (1 point), L = Loss (0 points)
 */
function calculateFormScore(form: string): number {
  if (!form) return 0;

  let score = 0;
  const multipliers = [1.5, 1.3, 1.1, 0.9, 0.7]; // Recent games weighted more

  for (let i = 0; i < form.length && i < 5; i++) {
    const result = form[i];
    const multiplier = multipliers[i] || 0.5;

    if (result === 'W') score += 3 * multiplier;
    else if (result === 'D') score += 1 * multiplier;
  }

  return score;
}

/**
 * Generate human-readable analysis
 */
function generateAnalysis(
  homeTeam: Team,
  awayTeam: Team,
  homeProbability: number,
  awayProbability: number,
  sport: string
): string {
  const diff = Math.abs(homeProbability - awayProbability);
  const favorite = homeProbability > awayProbability ? homeTeam.name : awayTeam.name;
  const underdog = homeProbability > awayProbability ? awayTeam.name : homeTeam.name;

  if (diff > 30) {
    return `${favorite} are strong favorites based on superior form and home advantage. ${underdog} will need an exceptional performance to upset the odds.`;
  } else if (diff > 15) {
    return `${favorite} have a moderate advantage with better recent form. However, ${underdog} have shown they can compete and could make this interesting.`;
  } else {
    return `This is expected to be a closely contested match. Both teams are evenly matched, making this a difficult game to predict with high confidence.`;
  }
}

/**
 * Generate predictions for multiple matches
 */
export function generatePredictions(matches: Match[]): Map<string, Prediction> {
  const predictions = new Map<string, Prediction>();

  matches.forEach((match) => {
    if (match.status === 'upcoming') {
      predictions.set(match.id, calculatePrediction(match));
    }
  });

  return predictions;
}
