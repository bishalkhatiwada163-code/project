import { NextResponse } from 'next/server';
import { keys as cacheKeys, del as cacheDel, inMemoryKeys } from '@/server/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple admin authorization using header token
function isAuthorized(req: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  try {
    const url = new URL(req.url);
    // check header via Request
    // Note: In Next's server runtime we can access headers via req.headers
    // But Request in Next has headers property
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const header = req.headers.get('x-admin-token');
    return header === token;
  } catch (err) {
    return false;
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const pattern = body.pattern || '*';

  try {
    const keysList = await cacheKeys(pattern);
    for (const k of keysList) {
      await cacheDel(k);
    }
    return NextResponse.json({ success: true, cleared: keysList.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
