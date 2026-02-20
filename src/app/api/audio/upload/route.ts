import { NextRequest, NextResponse } from 'next/server';
import { uploadAudio } from '@/lib/drive';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!audioFile || !userId) {
      return NextResponse.json({ error: 'Missing audio or userId.' }, { status: 400 });
    }

    // Validate size (10MB max)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio must be under 10MB.' }, { status: 400 });
    }

    // Validate type
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'File must be audio.' }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const fileId = await uploadAudio(buffer, audioFile.type, userId);

    return NextResponse.json({ fileId, success: true });
  } catch (err) {
    console.error('[POST /api/audio/upload]', err);
    return NextResponse.json({ error: 'Failed to upload audio.' }, { status: 500 });
  }
}
