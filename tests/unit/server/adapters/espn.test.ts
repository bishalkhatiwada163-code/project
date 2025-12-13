import { describe, it, expect } from 'vitest';
import { normalizeEventsToRecent, normalizeInjuries } from '../../../../server/adapters/espn';

describe('normalizeEventsToRecent', () => {
  it('normalizes events with competitions and home/away correctly', () => {
    const teamId = '13';
    const events = [
      {
        id: 'e1',
        date: '2024-01-01T12:00:00Z',
        competitions: [
          {
            date: '2024-01-01T12:00:00Z',
            competitors: [
              { team: { id: '13', displayName: 'Lakers' }, homeAway: 'home', score: '100' },
              { team: { id: '33', displayName: 'Opp' }, homeAway: 'away', score: '90' },
            ],
          },
        ],
      },
    ];

    const out = normalizeEventsToRecent(events, teamId);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: 'e1', opponent: 'Opp', score: '100-90', result: 'W' });
  });

  it('graduates draw and loss correctly', () => {
    const teamId = '13';
    const events = [
      {
        id: 'e2',
        competitions: [
          { competitors: [{ team: { id: '33' }, homeAway: 'home', score: '2' }, { team: { id: '13' }, homeAway: 'away', score: '2' }] },
        ],
      },
      {
        id: 'e3',
        competitions: [
          { competitors: [{ team: { id: '33' }, homeAway: 'home', score: '3' }, { team: { id: '13' }, homeAway: 'away', score: '1' }] },
        ],
      },
    ];

    const out = normalizeEventsToRecent(events, teamId);
    expect(out.map((r) => r.result)).toEqual(['D', 'L']);
  });

  it('handles event shaped without competitions', () => {
    const teamId = '13';
    const events = [
      {
        id: 'e4',
        date: '2024-02-01T12:00:00Z',
        competitors: [
          { team: { id: '13', displayName: 'Lakers' }, homeAway: 'home', score: '10' },
          { team: { id: '99', displayName: 'Small' }, homeAway: 'away', score: '12' },
        ],
      },
    ];

    const out = normalizeEventsToRecent(events, teamId);
    expect(out[0]).toMatchObject({ id: 'e4', opponent: 'Small', score: '10-12', result: 'L' });
  });

  it('normalizes injuries field', () => {
    const raw = [
      {
        id: 'i1',
        athlete: { id: 'p1', fullName: 'Jane Doe', position: { name: 'F' } },
        type: { description: 'INJ' },
        details: { type: 'hamstring', returnDate: '2024-03-01' },
      },
    ];

    const out = normalizeInjuries(raw);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: 'p1', name: 'Jane Doe', position: 'F', status: 'INJ', reason: 'hamstring', expectedReturn: '2024-03-01' });
  });
});
