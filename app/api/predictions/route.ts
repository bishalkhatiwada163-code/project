import { NextRequest, NextResponse } from 'next/server';
import { calculatePrediction } from '@/lib/predictor';
import { Match } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const match: Match = await request.json();

    // Generate prediction
    const prediction = calculatePrediction(match);

    return NextResponse.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate prediction',
      },
      { status: 500 }
    );
  }
}
