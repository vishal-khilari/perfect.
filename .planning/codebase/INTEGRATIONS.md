# External Integrations

## Google Drive API (v3)
- **Purpose:** Primary storage for posts (as Google Docs) and audio files.
- **Features Used:**
  - File/Folder creation and listing.
  - Custom file properties (used for metadata like mood, word count, reactions).
  - Permissions management (making posts public).
  - Media uploads (audio files).
- **Authentication:** OAuth2 using Client ID, Client Secret, and Refresh Token.

## Google Docs API (v1)
- **Purpose:** Content manipulation for posts.
- **Features Used:**
  - `documents.batchUpdate` for inserting text and applying styles (Heading 1).

## Rate Limiting
- **Implementation:** Custom local rate limiting in `src/lib/rateLimit.ts` (memory-based).
- **Usage:** Applied to API routes (e.g., audio upload).
