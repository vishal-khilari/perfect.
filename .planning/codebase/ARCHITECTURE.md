# Architecture

## Overview
The project follows a modern Next.js App Router architecture, leveraging both Server and Client Components. It is uniquely structured to use Google Drive as its primary database and storage layer.

## Key Patterns
- **Database-less Backend:** Instead of a traditional SQL/NoSQL database, the application interacts directly with Google Drive API.
- **Metadata in Properties:** Post metadata (mood, reactions, user ID) is stored in Google Drive file properties.
- **Client/Server Separation:**
  - **Server Components:** Used for data fetching (e.g., `src/app/page.tsx`).
  - **Client Components:** Used for interactivity (e.g., `src/app/LandingClient.tsx`).
- **Logic Encapsulation:** Core Google Drive operations are encapsulated in `src/lib/drive.ts`.

## Data Flow
1. **Creation:** User submits a post via `/write` -> API route `/api/posts` -> `createPost` in `lib/drive.ts` -> Google Drive.
2. **Retrieval:** Page component -> `getPublicPosts` in `lib/drive.ts` -> Google Drive list/get -> Rendered on server.
3. **Interactivity:** Reactions triggered via client components -> API route `/api/reactions` -> `updateReaction` in `lib/drive.ts`.
