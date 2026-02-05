## QA Automation Tests

This project includes automated tests at three layers.

**E2E (Playwright)**
- Location: `tests/e2e/`
- Command: `npm run test:e2e`
- Notes: E2E tests mock `/api/*` via Playwright route interception to avoid calling Last.fm.

**API Tests (Supertest + Vitest)**
- Location: `server/tests/integration/`
- Command: `npm run test:api`
- Notes: Uses `nock` to stub Last.fm requests.

**UI Unit Tests (Vitest + React Testing Library)**
- Location: `client/src/tests/unitary/`
- Setup file: `client/src/tests/setup.ts`
- Command: `npm run test:ui`

**Run everything**
- `npm run test`

**Requirements**
- Node.js 18+
- Playwright browsers installed once: `npx playwright install`
