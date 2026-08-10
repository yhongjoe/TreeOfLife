# Tree of Light 🌳

A 33-day gospel-mission journey for LDS Stake members preparing for Stake
Conference (Aug 18 – Sep 19, 2026). Each day unlocks a conference-talk
mission; testimonies members share light up an apple-shaped fruit on a single
illustrated tree, brightening from a dark silhouette (0% participation) to a
radiant glow (100%) as the whole stake participates together.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No setup required — the
app runs against a localStorage-backed demo store out of the box, seeded with
sample activity for Days 1–12 so the tree isn't blank on first load.

To preview the admin dashboard, click **"Preview Admin (demo)"** in the header
(or on `/admin` directly) — this is a demo-only toggle; see
[ARCHITECTURE.md](ARCHITECTURE.md#3-auth--roles) for how real role-based
access works once Supabase is wired up.

## What's here

- **The tree** — 33 interactive fruit, one per mission day, positioned with a
  phyllotaxis (sunflower-seed) layout, each glowing based on that day's
  participation (0–50 brightness scale) with a participant-count badge.
- **Hover / tap** a fruit for a testimony preview; **click** to open the full
  read-and-submit modal.
- **The 33-day schedule carousel** below the tree — click a card to focus the
  matching fruit above.
- **A day-by-day ambient background** that shifts through a warm dawn →
  daylight → dusk → radiant-finale arc across the 33 days.
- **Admin panel** (`/admin`) — participation stats, filterable testimony and
  member tables, one-click **Word (.docx) export**, and reset controls for
  individual days or the whole tree.

## Tech stack

Next.js 16 (App Router) + TypeScript + Tailwind v4, deployed free on Vercel;
Supabase (Postgres + Auth + Realtime) for the backend, also free tier. See
[ARCHITECTURE.md](ARCHITECTURE.md) for the full data schema and system design,
and [DEPLOYMENT.md](DEPLOYMENT.md) for the step-by-step guide to turning on
the real multi-user backend.

## Project docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — data schema, auth/role model, the
  dynamic background & fruit-brightness systems, admin panel design.
- [DEPLOYMENT.md](DEPLOYMENT.md) — free-tier Vercel + Supabase deployment,
  step by step.
- [supabase/schema.sql](supabase/schema.sql) / [supabase/seed.sql](supabase/seed.sql) — DB schema, RLS policies, and the 33-day mission seed data.
