import { NextRequest, NextResponse } from 'next/server';
import { deleteExpiredPosts } from '@/lib/drive';

// This endpoint is meant to be called by a Vercel cron job
// Configure in vercel.json: { "crons": [{ "path": "/api/drive/cleanup", "schedule": "0 3 * * *" }] }

export async function GET(req: NextRequest) {
  // Basic auth for the cron
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deleted = await deleteExpiredPosts();
    return NextResponse.json({
      success: true,
      deleted,
      message: `Burned ${deleted} expired posts.`,
    });
  } catch (err) {
    console.error('[GET /api/drive/cleanup]', err);
    return NextResponse.json({ error: 'Cleanup failed.' }, { status: 500 });
  }
}
