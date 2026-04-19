# Changd — Website Change Monitor
## Full Setup & Deployment Guide

---

## What You're Building

Changd is a self-hosted website change monitoring SaaS. It takes scheduled screenshots of URLs, compares them pixel-by-pixel, and notifies you when anything changes. Key capabilities:

- Visual screenshot monitoring (full-page via Playwright)
- XPath DOM content monitoring
- JSON API value monitoring
- Pixel-level diff with highlighted change images
- Cron-based scheduling (every 15 min → weekly)
- Dual email (Resend + SMTP fallback)
- In-app notification center
- Per-user configurable storage (UploadThing or S3)
- Monorepo ready for future mobile app

---

## Monorepo Structure

```
changd-monitor/
├── apps/
│   └── web/                    ← Next.js 15 app (the main webapp)
│       ├── src/
│       │   ├── app/            ← App Router pages + API routes
│       │   ├── components/     ← React components
│       │   └── lib/            ← Core business logic
│       ├── vercel.json         ← Vercel cron config
│       └── .env.example
├── packages/
│   ├── database/               ← Prisma schema + client singleton
│   └── shared/                 ← Types, constants shared across apps
├── docker-compose.yml          ← Local Postgres + Redis
├── turbo.json
└── package.json
```

> **Future mobile app:** Add `apps/mobile/` (Expo/React Native). It can import from `@changd/shared` and `@changd/database` immediately. Zero structural changes needed.

---

## Prerequisites

- Node.js >= 20
- npm >= 10
- Docker (for local Postgres + Redis)
- A [Neon](https://neon.tech) or [Supabase](https://supabase.com) account for production DB

---

## Step 1 — Clone & Install

```bash
git clone <your-repo> changd-monitor
cd changd-monitor
npm install
```

---

## Step 2 — Install shadcn/ui

shadcn components are NOT included as files — you install them via CLI.

```bash
cd apps/web

# Initialize shadcn (choose "New York" style, CSS variables: yes)
npx shadcn@latest init

# Install all required components
npx shadcn@latest add button card input label badge table tabs dialog \
  alert-dialog select switch tooltip avatar separator progress \
  popover dropdown-menu
```

This places component files in `apps/web/src/components/ui/`.

---

## Step 3 — Environment Variables

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Required | Where to get it |
|---|---|---|
| `DATABASE_URL` | ✅ | Local Docker or [Neon](https://neon.tech) |
| `REDIS_URL` | ✅ | Local Docker or [Upstash](https://upstash.com) |
| `BETTER_AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` locally |
| `UPLOADTHING_TOKEN` | ✅ (dev) | [uploadthing.com/dashboard](https://uploadthing.com/dashboard) |
| `RESEND_API_KEY` | Recommended | [resend.com](https://resend.com) |
| `CRON_SECRET` | ✅ | `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | Optional | Google Cloud Console |

---

## Step 4 — Start Local Services

```bash
# From repo root — starts Postgres + Redis
docker compose up -d
```

Verify:
```bash
docker compose ps
# Both postgres and redis should show "Up"
```

---

## Step 5 — Database Setup

```bash
# From repo root
npm run db:push

# Verify with Prisma Studio
npm run db:studio
```

---

## Step 6 — Install Playwright Browsers

```bash
cd apps/web
npx playwright install chromium
```

This downloads the Chromium binary that Playwright uses for screenshots.

---

## Step 7 — Run the App

You need **two terminal windows**:

**Terminal 1 — Next.js dev server:**
```bash
# From repo root
npm run dev
```

**Terminal 2 — Background worker (BullMQ):**
```bash
cd apps/web
npm run worker
```

Visit [http://localhost:3000](http://localhost:3000)

---

## How The Architecture Works

```
User creates monitor job
        │
        ▼
/api/jobs (POST) → saves to DB → scheduleMonitorJob() → BullMQ scheduler
                                                              │
                                                    Fires on cron schedule
                                                              │
                                                              ▼
                                                    screenshot-worker.ts
                                                              │
                                        ┌─────────────────────┤
                                        │                     │
                                   Playwright            XPath/JSON
                                  (screenshot)          (text extract)
                                        │
                                        ▼
                                  pixelmatch diff
                                        │
                                  Upload to storage
                                  (UploadThing / S3)
                                        │
                                  Save Screenshot record
                                        │
                              hasChanged? ──yes──▶ createNotification()
                                                        + EmailService.send()
```

**Vercel cron** hits `/api/cron` every minute → queries DB for due jobs → pushes to BullMQ queue → worker (separate process) picks up and executes.

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "initial"
git remote add origin https://github.com/yourname/changd-monitor
git push -u origin main
```

### 2. Import to Vercel

- Go to [vercel.com/new](https://vercel.com/new)
- Import your repo
- Set **Root Directory** to `apps/web`
- Set **Framework** to `Next.js`

### 3. Add Environment Variables

In Vercel project settings → Environment Variables, add all variables from `.env.example` with production values:

| Variable | Production Value |
|---|---|
| `DATABASE_URL` | Neon connection string (use pooled) |
| `REDIS_URL` | Upstash Redis URL (use `rediss://`) |
| `BETTER_AUTH_URL` | `https://yourdomain.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.vercel.app` |
| `CRON_SECRET` | Your generated secret |

### 4. Vercel Cron (Important)

The `vercel.json` already configures a cron job that hits `/api/cron` every minute. This triggers due screenshot jobs. The worker (`npm run worker`) is **not needed on Vercel** — Vercel's serverless functions handle execution directly via the queue.

> **Note:** For heavy workloads (100+ monitors), deploy the worker separately on [Railway](https://railway.app) or [Render](https://render.com) pointing to the same `REDIS_URL` and `DATABASE_URL`.

### 5. Deploy

```bash
vercel --prod
```

Or push to `main` and Vercel auto-deploys.

---

## Worker Deployment (Production, Optional)

If you have many monitors or long-running jobs, run the worker separately:

**Railway:**
1. New project → Deploy from GitHub
2. Root directory: `apps/web`
3. Start command: `npm run worker`
4. Add same env vars as Vercel

**Render:**
1. New Web Service → Docker or Node
2. Build: `npm install && npx playwright install chromium`
3. Start: `npm run worker`

---

## Neon DB Setup (Production)

1. Create project at [neon.tech](https://neon.tech)
2. Copy the **pooled connection string** (not direct)
3. Set as `DATABASE_URL`
4. Run: `npm run db:migrate` (creates migration history)

---

## Upstash Redis Setup

1. Create database at [upstash.com](https://upstash.com)
2. Copy the `UPSTASH_REDIS_URL` (starts with `rediss://`)
3. Set as `REDIS_URL`

---

## Adding shadcn Components Later

```bash
cd apps/web
npx shadcn@latest add <component-name>

# Example:
npx shadcn@latest add calendar
npx shadcn@latest add chart
```

---

## Common Issues

### "Cannot find module @changd/database"
Run `npm install` from the **repo root**, not `apps/web`. The workspace symlinks are created at root.

### "Playwright browsers not found"
```bash
cd apps/web && npx playwright install chromium
```
On Vercel, add this to your build command:
`npm run build && npx playwright install chromium`

### "Redis connection refused"
Make sure Docker is running: `docker compose up -d`
Or check your `REDIS_URL` value.

### "UploadThing upload failed"
- Verify `UPLOADTHING_TOKEN` is set (not `UPLOADTHING_SECRET`)
- Check uploadthing dashboard for the correct token format

### "Better Auth session not found"
- Ensure `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are set correctly
- `BETTER_AUTH_URL` must match your actual app URL exactly

### Cron not firing locally
The `/api/cron` endpoint only fires automatically on Vercel. Locally, trigger it manually:
```bash
curl -X POST http://localhost:3000/api/cron \
  -H "Authorization: Bearer your-cron-secret"
```

---

## Extending the App

### Add a mobile app
```bash
mkdir apps/mobile
cd apps/mobile
npx create-expo-app . --template blank-typescript
# Add @changd/shared to package.json dependencies
```

### Add more monitor types
1. Add enum value to `monitorType` in Prisma schema
2. Add handler in `screenshot-worker.ts`
3. Add UI tab in `job-form.tsx`

### Add team/workspace support
1. Add `Workspace` model to Prisma schema
2. Add `workspaceId` to `MonitorJob`
3. Update auth middleware to scope queries by workspace

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth | Better Auth |
| Database ORM | Prisma |
| Database | PostgreSQL (Neon) |
| Queue | BullMQ + Redis (Upstash) |
| Screenshots | Playwright (Chromium) |
| Image Diff | pixelmatch + pngjs |
| Storage (dev) | UploadThing |
| Storage (prod) | AWS S3 |
| Email | Resend + nodemailer (SMTP) |
| UI | shadcn/ui + Tailwind CSS |
| Monorepo | Turborepo |
| Deployment | Vercel + optional Railway worker |
