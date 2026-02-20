import { NextRequest, NextResponse } from 'next/server';
import { createPost } from '@/lib/drive';
import { checkRateLimit } from '@/lib/rateLimit';
import { SubmitPostPayload } from '@/types';

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait a moment.' },
      { status: 429 }
    );
  }

  try {
    const body: SubmitPostPayload = await req.json();

    // Validation
    if (!body.body || body.body.trim().length < 10) {
      return NextResponse.json({ error: 'Text must be at least 10 characters.' }, { status: 400 });
    }

    if (body.body.length > 10000) {
      return NextResponse.json({ error: 'Text must be under 10,000 characters.' }, { status: 400 });
    }

    if (!body.userId) {
      return NextResponse.json({ error: 'Missing user ID.' }, { status: 400 });
    }

    const validMoods = ['Rain', 'Static', 'Silence', 'Night'];
    if (!validMoods.includes(body.mood)) {
      return NextResponse.json({ error: 'Invalid mood.' }, { status: 400 });
    }

    const wordCount = body.body.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const fileId = await createPost({
      title: body.title?.substring(0, 200) || '',
      name: body.name?.substring(0, 80) || 'Anonymous',
      mood: body.mood,
      body: body.body,
      wordCount,
      readingTime,
      userId: body.userId,
      isPrivate: body.isPrivate || false,
      audioFileId: body.audioFileId,
      burnAfterDays: body.burnAfterDays,
    });

    return NextResponse.json({ fileId, success: true });
  } catch (err) {
    console.error('[POST /api/posts]', err);
    return NextResponse.json({ error: 'Failed to save your words.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = (searchParams.get('sort') || 'latest') as 'latest' | 'oldest' | 'random';
  const mood = searchParams.get('mood') || undefined;
  const audioOnly = searchParams.get('audioOnly') === '1';
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const { getPublicPosts } = await import('@/lib/drive');
    const posts = await getPublicPosts({
      limit,
      mood,
      orderBy: sort,
      audioOnly,
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error('[GET /api/posts]', err);
    return NextResponse.json({ posts: [] });
  }
}
