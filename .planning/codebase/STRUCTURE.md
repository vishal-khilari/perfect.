# Project Structure

## Root Directories
- `src/app`: Routes, API endpoints, and global layouts.
- `src/components`: UI components.
- `src/lib`: Core logic and utilities.
- `src/types`: TypeScript definitions.

## Key Files
- `src/lib/drive.ts`: Central hub for all Google Drive/Docs operations.
- `src/lib/rateLimit.ts`: Rate limiting logic for API protection.
- `src/app/page.tsx`: Entry point for the landing page.
- `src/app/globals.css`: Global styling and Tailwind directives.

## Components Organization
- `src/components/audio`: Audio-related components (e.g., `AudioRecorder.tsx`).
- `src/components/layout`: Layout-specific components (e.g., `Nav.tsx`).
- `src/components/ui`: Generic UI components (e.g., `PostCard.tsx`, `FirstVisitModal.tsx`).
