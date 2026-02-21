# Tech Debt & Known Concerns

## Dependency on Google Drive
- The application is tightly coupled to the Google Drive API.
- Any latency or downtime in Google Services directly impacts the application.
- Rate limits on the Google Drive API could become a bottleneck as the user base grows.

## Performance
- Listing public posts involves iterating through user folders, which might become slow with many users.
- Each post listing currently requires additional API calls to fetch previews if not cached.

## Data Integrity
- Reactions and metadata are stored in file properties. Without a traditional database, complex queries or atomic updates might be difficult.
- No current backup mechanism for post data outside of Google Drive.

## Testing
- Complete lack of automated tests increases the risk of regressions during refactoring.

## Security
- API routes like `/api/audio/upload` rely on a simple memory-based rate limiter which resets on server restart.
