import { NextRequest, NextResponse } from 'next/server';
import { updateReaction } from '@/lib/drive';

export async function POST(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { reaction } = await req.json();

    const validReactions = ['felt', 'alone', 'understand'];
    if (!validReactions.includes(reaction)) {
      return NextResponse.json({ error: 'Invalid reaction type.' }, { status: 400 });
    }

    await updateReaction(params.fileId, reaction as 'felt' | 'alone' | 'understand');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/reactions]', err);
    return NextResponse.json({ error: 'Failed to save reaction.' }, { status: 500 });
  }
}
