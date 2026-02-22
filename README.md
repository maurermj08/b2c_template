# B2C Monorepo

A Turborepo monorepo for B2C web applications. Includes a fully working starter app (ReadWriting) with authentication, navigation, dashboard shell, user settings, support page, and responsive layout — plus an admin app scaffold.

## Tech Stack

- **Turborepo** — monorepo build system
- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Prisma 6** with SQLite (dev) / PostgreSQL (prod)
- **Auth.js v5** (next-auth@beta) — passwordless magic link auth
- **Lucide React** icons

## Monorepo Structure

```
apps/
  readwriting/       # Main app — handwriting to digital text (port 3000)
  admin/             # Admin dashboard (port 3001)
packages/
  ui/                # Shared UI components (@repo/ui)
  db/                # Shared database package (@repo/db)
  typescript-config/ # Shared TypeScript config (@repo/typescript-config)
```

## Quick Start

```bash
# Install all dependencies (root + all workspaces)
npm install

# Generate Prisma client and run migrations for readwriting
npx prisma generate --schema=apps/readwriting/prisma/schema.prisma
npx prisma migrate dev --name init --schema=apps/readwriting/prisma/schema.prisma

# Seed the database (creates a demo user)
npm run -w readwriting prisma db seed

# Start all apps
turbo dev
```

| App | URL |
|-----|-----|
| ReadWriting | [http://localhost:3000](http://localhost:3000) |
| Admin | [http://localhost:3001](http://localhost:3001) |

## Turbo Commands

```bash
# Development
turbo dev                        # Run all apps concurrently
turbo dev --filter=readwriting   # Run only ReadWriting
turbo dev --filter=admin         # Run only Admin

# Build
turbo build                      # Build all apps
turbo build --filter=readwriting # Build only ReadWriting

# Lint & Test
turbo lint                       # Lint all apps
turbo test                       # Playwright e2e tests (all apps)
turbo test:unit                  # Vitest unit tests (all apps)
```

### Filtering

Turborepo's `--filter` flag lets you target specific apps or packages:

```bash
turbo build --filter=readwriting        # Just the readwriting app
turbo build --filter=admin              # Just the admin app
turbo build --filter=./apps/*           # All apps
turbo build --filter=./packages/*       # All packages
turbo lint --filter=readwriting...      # Readwriting + its dependencies
```

### Caching

Turborepo caches build outputs automatically. Subsequent builds skip work that hasn't changed:

```bash
turbo build                # First run — builds everything
turbo build                # Second run — cache hit, near-instant
turbo build --force        # Skip cache, rebuild everything
```

Cache artifacts are stored in `.turbo/` directories (gitignored).

### Adding a New App

1. Create a new directory under `apps/`
2. Add a `package.json` with a unique `name` and the scripts you need (`dev`, `build`, `lint`)
3. Run `npm install` from the root to link workspaces
4. Turbo automatically picks it up — `turbo dev` will include it

### Using Shared Packages

Import shared packages by their workspace name:

```tsx
// In any app — import shared UI components
import { Button } from "@repo/ui/button";

// Import shared utilities
import { cn } from "@repo/ui/utils";
```

Add new shared packages under `packages/` with a `package.json` that has a `name` starting with `@repo/`.

## How Auth Works

In development, magic links are printed to the **terminal console** instead of being sent via email. No SMTP, no API keys required.

1. Go to `/login` and enter any email address
2. Check your terminal — you'll see a line like: `Magic link for user@example.com: http://localhost:3000/api/auth/callback/email?token=...`
3. Click/open that link to sign in

## Environment Variables

Dev defaults are in `.env` (committed). Override anything by creating `.env.local` (gitignored):

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite for dev, PostgreSQL for prod |
| `AUTH_SECRET` | dev placeholder | Generate for prod: `npx auth secret` |
| `NEXTAUTH_URL` | `http://localhost:3000` | Your app URL |
| `NEXT_PUBLIC_APP_NAME` | `ReadWriting` | App name shown in UI |
| `RESEND_API_KEY` | — | For production email delivery |
| `EMAIL_FROM` | — | Sender address for production emails |

## ReadWriting App Structure

```
apps/readwriting/src/
  app/
    (auth)/          # Public auth pages (login, verify, auth-error)
    (app)/           # Authenticated pages (dashboard, settings, support)
    api/auth/        # Auth.js API route
  components/
    ui/              # Button, Input, Card, Badge, Avatar, LoadingSpinner
    auth/            # LoginForm, SignOutButton
    layout/          # Sidebar, Header, MobileNav, UserMenu, PublicHeader/Footer
  actions/           # Server actions (auth, user, support)
  lib/               # Auth config, Prisma client, utilities
```

## Docker Deployment

```bash
docker build -t my-app .
docker compose up
```

The Docker setup uses PostgreSQL. Set `AUTH_SECRET` and update `DATABASE_URL` for production.
