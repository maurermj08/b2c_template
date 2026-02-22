# B2C Starter Template

A reusable starter template for simple B2C web applications. Includes authentication, navigation, dashboard shell, user settings, support page, and responsive layout — all working end-to-end.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Prisma 6** with SQLite (dev) / PostgreSQL (prod)
- **Auth.js v5** (next-auth@beta) — passwordless magic link auth
- **Lucide React** icons

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed the database (creates a demo user)
npx prisma db seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

That's it — the `.env` file is committed with safe dev defaults. No additional setup needed.

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
| `NEXT_PUBLIC_APP_NAME` | `My App` | App name shown in UI |
| `RESEND_API_KEY` | — | For production email delivery |
| `EMAIL_FROM` | — | Sender address for production emails |

## Project Structure

```
src/
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

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Playwright e2e tests
npm run test:unit # Vitest unit tests
```

## Docker Deployment

```bash
docker build -t my-app .
docker compose up
```

The Docker setup uses PostgreSQL. Set `AUTH_SECRET` and update `DATABASE_URL` for production.

## Customizing for Your Project

1. Set `NEXT_PUBLIC_APP_NAME` in `.env.local`
2. Add domain models in `prisma/schema.prisma`
3. Add pages under `src/app/(app)/your-feature/`
4. Add nav items in `app-sidebar.tsx` and `mobile-nav.tsx`
5. Update landing page content and support FAQ
6. Switch to PostgreSQL when deploying (see comments in schema)
