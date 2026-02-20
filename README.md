# The Quiet Room

> *A quiet digital archive. Where people leave pieces of themselves.*

A minimalist, emotional public storytelling platform built with Next.js 14 and Google Drive as a structured document database. Inspired by existential themes.

---

## What This Is

- A dark, silent web app where people submit written confessions or reflections
- Posts are stored as **Google Docs** inside a structured **Google Drive** hierarchy
- No accounts required — sessions are anonymous with localStorage UUIDs
- Audio accompaniments can be recorded or uploaded
- Reactions (not likes) are stored in Drive file properties
- Posts can optionally self-destruct after 7 days

---

## Folder Structure

```
the-quiet-room/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, grain texture, beetle watermark
│   │   ├── globals.css             # Design system CSS
│   │   ├── page.tsx                # Landing page (/) — server component
│   │   ├── LandingClient.tsx       # Landing page interactivity
│   │   ├── not-found.tsx           # 404 page
│   │   ├── write/
│   │   │   └── page.tsx            # Write page (/write)
│   │   ├── room/
│   │   │   └── page.tsx            # Archive page (/room)
│   │   ├── post/
│   │   │   └── [fileId]/
│   │   │       ├── page.tsx        # Post page server component
│   │   │       └── PostPageClient.tsx
│   │   └── api/
│   │       ├── posts/
│   │       │   └── route.ts        # GET/POST posts
│   │       ├── reactions/
│   │       │   └── [fileId]/route.ts
│   │       ├── audio/
│   │       │   ├── upload/route.ts
│   │       │   └── [fileId]/route.ts  # Audio proxy stream
│   │       └── drive/
│   │           └── cleanup/route.ts   # Cron: burn expired posts
│   ├── components/
│   │   ├── layout/
│   │   │   └── Nav.tsx
│   │   ├── ui/
│   │   │   ├── PostCard.tsx
│   │   │   ├── FirstVisitModal.tsx
│   │   │   └── MidnightWrapper.tsx
│   │   └── audio/
│   │       └── AudioRecorder.tsx
│   ├── lib/
│   │   ├── drive.ts                # All Google Drive + Docs API logic
│   │   └── rateLimit.ts            # IP-based rate limiting
│   └── types/
│       └── index.ts
├── public/
├── vercel.json                     # Cron job configuration
├── .env.local.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Google Cloud Setup

### Step 1: Enable APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `the-quiet-room-487715`
3. Navigate to **APIs & Services → Library**
4. Enable:
   - **Google Drive API**
   - **Google Docs API**

### Step 2: Create a Service Account

1. Go to **IAM & Admin → Service Accounts**
2. Click **Create Service Account**
3. Name it: `quiet-room-server`
4. Description: `Server-side access for The Quiet Room app`
5. Click **Create and Continue**
6. Skip role assignment (access is via Drive sharing)
7. Click **Done**

### Step 3: Generate a JSON Key

1. Click your new service account
2. Go to **Keys** tab
3. Click **Add Key → Create New Key**
4. Choose **JSON**
5. Download the file (keep it SAFE, never commit it)

### Step 4: Create the Root Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder: **"The Quiet Room"**
3. Right-click → Share
4. Share with your **service account email** (e.g., `quiet-room-server@the-quiet-room-487715.iam.gserviceaccount.com`)
5. Give it **Editor** access
6. Copy the folder ID from the URL:
   - URL: `https://drive.google.com/drive/folders/1ABC123XYZ`
   - Folder ID: `1ABC123XYZ`

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# From the JSON key file you downloaded
GOOGLE_CLIENT_EMAIL=quiet-room-server@the-quiet-room-487715.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYOUR_FULL_KEY_WITH_ESCAPED_NEWLINES\n-----END RSA PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=the-quiet-room-487715

# The Drive folder ID from Step 4 above
GOOGLE_DRIVE_ROOT_FOLDER_ID=1ABC123XYZ

# Optional: for the cron cleanup endpoint
CRON_SECRET=any_random_secret_string

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important for `GOOGLE_PRIVATE_KEY`:** The key in the JSON file has actual newlines. In `.env.local`, replace each newline with `\n` so it's one long string, and wrap the whole value in double quotes.

You can extract and format it with this command:
```bash
cat your-key-file.json | python3 -c "
import json,sys
data = json.load(sys.stdin)
key = data['private_key'].replace('\n', '\\\\n')
print(f'GOOGLE_CLIENT_EMAIL={data[\"client_email\"]}')
print(f'GOOGLE_PRIVATE_KEY=\"{key}\"')
"
```

---

## Local Development

```bash
# Install dependencies
npm install

# Create env file
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Vercel Deployment

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "The Quiet Room"
git remote add origin https://github.com/YOUR_USERNAME/the-quiet-room.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Import Project
2. Select your GitHub repository
3. Framework: **Next.js** (auto-detected)

### Step 3: Add Environment Variables

In Vercel project settings → **Environment Variables**, add all variables from your `.env.local`.

For `GOOGLE_PRIVATE_KEY` in Vercel:
- Paste the raw key (with actual newlines, not `\n`)
- Vercel handles the encoding automatically

### Step 4: Deploy

Click **Deploy**. The cron job (`vercel.json`) will automatically run the burn-after cleanup at 3 AM daily.

---

## Google Drive Database Structure

The app automatically creates this structure on first use:

```
📁 The Quiet Room (your root folder)
├── 📁 public-posts
│   └── 📁 user-{uuid}
│       ├── 📄 My Post Title (Google Doc)
│       └── 📄 Another Post  (Google Doc)
├── 📁 private-drafts
│   └── 📁 user-{uuid}
│       └── 📄 Private Post (Google Doc)
└── 📁 audio-files
    ├── 🎵 audio-{uuid}-{timestamp}
    └── 🎵 audio-{uuid}-{timestamp}
```

Each Google Doc contains:
- Formatted content via Docs API (title as Heading 1)
- All metadata stored in Drive **file properties** (fast to query)
- Reaction counts updated in place via Drive properties

---

## API Reference

### `POST /api/posts`
Create a new post.

```json
{
  "title": "Optional title",
  "name": "Anonymous",
  "body": "The main text content...",
  "mood": "Rain | Static | Silence | Night",
  "userId": "uuid-from-localstorage",
  "isPrivate": false,
  "burnAfterDays": 7,
  "audioFileId": "optional-drive-file-id"
}
```

Returns: `{ fileId: "google-drive-doc-id", success: true }`

### `GET /api/posts`
Fetch public posts.

Query params:
- `sort`: `latest | oldest | random`
- `mood`: `Rain | Static | Silence | Night`
- `audioOnly`: `1`
- `limit`: number

### `POST /api/reactions/[fileId]`
Add a reaction to a post.

```json
{ "reaction": "felt | alone | understand" }
```

### `POST /api/audio/upload`
Upload an audio file (multipart/form-data).

Fields: `audio` (File), `userId` (string)

Returns: `{ fileId: "drive-audio-id", success: true }`

### `GET /api/audio/[fileId]`
Streams audio from Drive (proxied server-side — credentials never exposed).

### `GET /api/drive/cleanup`
Deletes expired "burn after" posts. Protected by `CRON_SECRET` header.

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--void` | `#0e0e0e` | Background |
| `--dust` | `#1a1a1a` | Subtle surfaces |
| `--ash` | `#2a2a2a` | Borders |
| `--mist` | `#3d3d3d` | Disabled, de-emphasized |
| `--pale` | `#888888` | Secondary text |
| `--ghost` | `#b0b0b0` | Body text |
| `--whisper` | `#f1f1f1` | Primary text |
| `--rain` | `#6b7f8f` | Rain mood |
| `--static` | `#7a7a8a` | Static mood |
| `--silence` | `#8f8f7a` | Silence mood |
| `--night` | `#4a5a6a` | Night mood |

Typography:
- Headings: **EB Garamond** (literary serif)
- Body: **DM Sans** (clean, restrained)
- Code/meta: **Courier Prime** (monospace)

---

## Features

- **Write Page**: Expandable textarea, mood selector, audio record/upload, auto-save draft, word counter, live character count, typing sound toggle, private/burn options
- **The Room**: Sort by latest/oldest/random, filter by mood, audio-only filter, random confession button
- **Post Page**: Full reading view, audio player (server-proxied), three-type reaction system
- **Midnight Mode**: Background darkens automatically between midnight–5 AM
- **Grain Texture**: CSS-animated grain overlay for atmosphere
- **Beetle Watermark**: Barely-visible Kafka reference, SVG, geometric
- **Burn After 7 Days**: Via `burnAfter` timestamp in Drive properties + daily cron cleanup
- **First Visit Modal**: localStorage-gated, single display
- **Rate Limiting**: IP-based, in-memory (use Redis/Upstash for production scale)
- **Server-Side Only API Calls**: No credentials ever reach the browser

---

## Security Notes

1. **Never commit `.env.local`** — it's in `.gitignore`
2. **Never commit service account JSON** — it's in `.gitignore`
3. **Audio is proxied** through `/api/audio/[fileId]` — users never get direct Drive URLs with your credentials
4. **Rate limiting** prevents spam (5 req/min per IP)
5. **File type validation** on audio upload
6. **Length validation** on post body (10–10,000 chars)

---

## Extending

**Want Redis-based rate limiting?**
Replace `src/lib/rateLimit.ts` with an Upstash Redis implementation.

**Want search?**
Add a Google Sheets "index" that maps keywords → file IDs, updated on each post creation.

**Want email notifications?**
Add a Resend or Nodemailer call in the `POST /api/posts` handler.

**Want multiple languages?**
Add `next-intl` and adjust the mood labels.

---

*Slow. Soft. Existential. Silent.*
