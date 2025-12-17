import { NextResponse } from 'next/server';
import { fetchOrSet } from '@/server/cache';
import * as cheerio from 'cheerio';

const MOCK = [{ id: 'ind1', name: 'Virat Kohli', position: 'Batter', status: 'Active', reason: null, expectedReturn: null }];

async function fetchHtml(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = params;
  const cacheKey = `cricinfo:team:${teamId}:injuries`;
  const ttl = Number(process.env.CACHE_TTL_INJURIES || '300');

  const data = await fetchOrSet(cacheKey, ttl, async () => {
    // use env.template or default to common cricket site paths
    const template = process.env.ESPNCRICINFO_TEAM_TEMPLATE || 'https://www.espncricinfo.com/team/{slug}-{teamId}';
    const target = template.replace('{teamId}', encodeURIComponent(teamId)).replace('{slug}', 'team');
    const body = await fetchHtml(target);
    if (!body) return MOCK;

    const $ = cheerio.load(body);
    const players: any[] = [];

    // Attempt to find squad list and associated notes
    // This is best-effort; structure may change -- look for player links in the team page
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (!text) return;
      // player links often contain '/cricketers/' in the href
      if (href.includes('/cricketers/')) {
        const idMatch = href.match(/-(\d+)/);
        const id = idMatch ? idMatch[1] : `${teamId}-${i}`;
        // see if surrounding element contains 'injur' related text
        const parentText = $(el).parent().text() || '';
        const status = /injur|out|ruled|doubtful|day-to-day|questionable/i.test(parentText) ? 'Out' : 'Active';
        const reasonMatch = parentText.match(/injur(?:y)?:?\s*([A-Za-z0-9\s,-]+)/i);
        const reason = reasonMatch ? reasonMatch[1].trim() : null;
        players.push({ id, name: text, position: null, status, reason, expectedReturn: null });
      }
    });

    return players.length ? players : MOCK;
  });

  return NextResponse.json({ success: true, data });
}
