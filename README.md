# Music Data Explorer

**Overview**
Music Data Explorer is a full‑stack app that consumes Last.fm to surface meaningful insights about artists, tracks, and albums with interactive charts. The frontend is React + Vite + TypeScript + Tailwind + Recharts, and the backend is Node.js + Express + TypeScript with caching and rate limiting.

**Features**
- Artist search with top matches, images, and listener counts.
- Album search with top matches and album detail pages.
- Artist overview: stats, top tags, top tracks, popularity spread chart, tag distribution chart, outliers, and trend fallback insights.
- Album overview: stats, top tags, tracklist with durations, track duration spread chart, and longest vs shortest tracks.
- Dark UI, responsive dashboard layout, loading/error/empty states, and abortable requests.

**Architecture**
- Client: React + Vite + TypeScript, Tailwind CSS, Recharts.
- Server: Node.js + Express + TypeScript.
- Flow: Client -> Server (REST JSON) -> Last.fm.
- Backend protection: in‑memory cache (TTL 10 minutes) + basic IP rate limiting (60 req/min).

**API Endpoints**
- `GET /api/health`
- `GET /api/search/artist?q=`
- `GET /api/search/album?q=`
- `GET /api/artist/:name/overview`
- `GET /api/album/overview?artist=&album=`

**Setup**
1. Install dependencies: `npm install`
2. Configure environment variables: copy `server/.env.example` to `server/.env`, set `LASTFM_API_KEY=...`, and optionally set `PORT`. If you need a custom API base URL, copy `client/.env.example` to `client/.env` and set `VITE_API_BASE`.
3. Start in dev mode: `npm run dev`

**Scripts**
- `npm run dev` runs client and server concurrently.
- `npm run build` builds both apps.
- `npm run lint` lints both apps.
- `npm run test` runs API, UI unit, and E2E tests.

**Testing**
See `README_TESTS.md` for details on API, UI unit, and E2E test suites.

**Notes and Limitations**
- Last.fm does not provide per‑artist time series without a user context; the app displays an alternative trend insight using similar artists.
- Some artists lack images, tags, or bios; the UI falls back gracefully. If Last.fm returns a placeholder image, a Deezer image fallback is attempted.
- All Last.fm calls go through the backend; the API key is never exposed in the client.
