import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const range = req.headers.get('range');

    // First, get file metadata to ensure we have the correct size and mimeType
    const meta = await drive.files.get({
      fileId: params.fileId,
      fields: 'size, mimeType',
    });

    const fileSize = parseInt(meta.data.size || '0');
    const contentType = meta.data.mimeType || 'audio/webm';

    const driveResponse = await drive.files.get(
      {
        fileId: params.fileId,
        alt: 'media',
      },
      { 
        responseType: 'stream',
        headers: range ? { Range: range } : {},
      }
    );

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Accept-Ranges', 'bytes');
    // Allow browser caching for 24 hours, which is better for media streaming
    headers.set('Cache-Control', 'public, max-age=86400, immutable');

    // Transfer critical headers from Google Drive response
    if (driveResponse.headers['content-range']) {
      headers.set('Content-Range', driveResponse.headers['content-range'] as string);
    }
    if (driveResponse.headers['content-length']) {
      headers.set('Content-Length', driveResponse.headers['content-length'] as string);
    } else if (!range && fileSize > 0) {
      headers.set('Content-Length', fileSize.toString());
    }

    const status = range ? 206 : 200;

    // Convert Node.js Readable stream to Web ReadableStream
    const nodeStream = driveResponse.data as Readable;
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => controller.enqueue(chunk));
        nodeStream.on('end', () => controller.close());
        nodeStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        nodeStream.destroy();
      }
    });

    return new NextResponse(webStream, {
      status,
      headers,
    });
  } catch (err: any) {
    console.error('[GET /api/audio]', err);
    if (err.code === 416) {
      return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */*` } });
    }
    return NextResponse.json({ error: 'Audio not found.' }, { status: 404 });
  }
}
