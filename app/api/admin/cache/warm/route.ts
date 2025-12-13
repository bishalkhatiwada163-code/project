import { NextResponse } from 'next/server';

function isAuthorized(req: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  // @ts-ignore
  const header = req.headers.get('x-admin-token');
  return header === token;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cronModule = require('@/server/cron');
    if (cronModule && typeof cronModule.warmCaches === 'function') {
      cronModule.warmCaches();
      return NextResponse.json({ success: true, message: 'Warming started' });
    }
    return NextResponse.json({ success: false, error: 'Warm function not available' }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
