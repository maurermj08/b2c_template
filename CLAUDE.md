# CLAUDE.md — Agent Instructions for ReadWriting

## Project Overview

Turborepo monorepo with a Next.js 16 (App Router) ReadWriting app and an admin scaffold.

- **Main app**: `apps/readwriting/` (port 3000)
- **Admin app**: `apps/admin/` (port 3001)
- **Shared packages**: `packages/ui/`, `packages/db/`, `packages/typescript-config/`

## Quick Reference

```bash
npm install                          # Install all deps
npx turbo build                      # Build both apps
npx turbo lint                       # Lint both apps
npx turbo test:unit                  # Unit tests (Vitest)
cd apps/readwriting && npx playwright test  # E2E tests (Playwright)
```

## Environment Setup

- Dev defaults live in `apps/readwriting/.env` (committed, safe)
- Real secrets go in `apps/readwriting/.env.local` (gitignored)
- Copy `.env.local.example` to `apps/readwriting/.env.local` for production keys

## UI Validation Process

**After ANY frontend change, run this checklist before committing:**

### Step 1: Build passes

```bash
npx turbo build
```

All apps must compile with zero errors.

### Step 2: Lint passes

```bash
npx turbo lint
```

### Step 3: Unit tests pass

```bash
npx turbo test:unit
```

### Step 4: E2E tests pass (Playwright)

```bash
cd apps/readwriting
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=~/.cache/ms-playwright/chromium-1194/chrome-linux/chrome \
  npx playwright test
```

If browsers are not installed, try: `npx playwright install chromium`

**If Playwright downloads are blocked**, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to point to an available Chromium binary.

### Step 5: Review failure screenshots

When Playwright tests fail, **always read the screenshot** at:
```
apps/readwriting/test-results/<test-name>/test-failed-1.png
```

Use the Read tool to view the screenshot image — this is how you see the actual UI without a browser. Screenshots show what the user would see, so check for:
- Correct branding (app name, logos)
- Correct page content and headings
- Layout issues (overlapping elements, missing sections)
- Broken states (error pages where there shouldn't be)

### Step 6: Spot-check with curl (quick sanity)

```bash
# Start dev server, test key routes, stop
npx turbo dev --filter=readwriting &
sleep 12
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/       # 200
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/login  # 200
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/dashboard # 307 (redirect)
```

## Writing E2E Tests

- Test files go in `apps/readwriting/tests/e2e/*.spec.ts`
- Use `main` scoping for `h1` selectors on authenticated pages (header has a duplicate `h1`):
  ```ts
  const main = page.locator("main");
  await expect(main.locator("h1")).toContainText("Dashboard");
  ```
- Use the auth helper for authenticated tests:
  ```ts
  import { loginAsUser, cleanupTestUser } from "../helpers/auth-helper";
  await loginAsUser(page, "test@example.com");
  ```
- Always clean up test users in `afterEach` or `afterAll`

## What Tests Should Cover

Every user-visible page should have at least one E2E test asserting:
1. **Correct heading/title text** — catches hardcoded fallbacks, missing env vars
2. **Key interactive elements exist** — buttons, forms, links
3. **Branding is consistent** — app name appears correctly, not "My App" or other defaults
4. **Protected routes redirect** — unauthenticated access goes to login
5. **Core flows work end-to-end** — login, settings update, sign out

## Prisma / Database

- Schema: `apps/readwriting/prisma/schema.prisma`
- Dev DB: SQLite at `apps/readwriting/prisma/dev.db`
- Generate client: `npx prisma generate --schema=apps/readwriting/prisma/schema.prisma`
- Run migrations: `cd apps/readwriting && npx prisma migrate dev`

## Key Architecture Notes

- `NEXT_PUBLIC_*` vars are inlined at build time — changes require a rebuild
- Auth uses NextAuth v5-beta with magic links (dev mode logs links to console)
- The app layout has dual `h1` tags (header + page content) — use `main` scoping in tests
- Playwright config supports `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` env var override
