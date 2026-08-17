# Tree of Light — Architecture

A 33-day gospel-mission tracker for Stake Conference (Aug 18 – Sep 19, 2026). This
document covers the data schema, the auth/role model, the admin panel design,
and the two "systems" the visual design leans on: the dynamic daily background
and the fruit brightness scale.

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind v4 | Free-tier friendly on Vercel; RSC + client components mix well here |
| Data / Auth | Supabase (Postgres + Auth + Realtime) | Free tier covers a single stake easily; Realtime gives instant fruit updates |
| Docx export | `docx` + `file-saver` | Pure client-side `.docx` generation, no server needed |
| Hosting | Vercel (frontend) + Supabase (backend) | Both have generous free tiers — see DEPLOYMENT.md |

The app runs in one of two modes, chosen automatically by `src/lib/supabase/client.ts`:

- **Demo mode** (default, no env vars set): all reads/writes go through
  `src/data/mockStore.ts`, a localStorage-backed store with the same shape as
  the Postgres tables. Zero setup — `npm run dev` just works.
- **Live mode** (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  set): every hook in `src/lib/dataService.ts` switches to real Supabase
  queries + Realtime subscriptions instead. No component code changes either
  way — they only ever import from `dataService.ts`.

## 2. Data schema

Full DDL: [`supabase/schema.sql`](supabase/schema.sql). Seed data (the 33-day
schedule): [`supabase/seed.sql`](supabase/seed.sql).

```
auth.users (Supabase-managed)
      │ 1:1
      ▼
public.profiles            public.missions               public.stake_settings
  id (=auth.users.id)        day (PK, 1-33)                 id (singleton, true)
  display_name               mission_date                   stake_name
  role  member|admin         speaker                        total_members
  created_at                 talk_title                     conference_date
      │                          │
      │ 1:N                      │ 1:N
      ▼                          ▼
              public.testimonies
                id (PK)
                day       ──FK──> missions.day
                user_id   ──FK──> auth.users.id
                author_name
                message
                created_at
                UNIQUE (day, user_id)   -- one testimony per member per day

public.daily_stats  (view, not a table)
  day, participant_count, brightness   -- see formula below
```

Key design choices:

- **`UNIQUE (day, user_id)`** turns "submit a testimony" and "edit today's
  testimony" into the same operation — the client always calls `upsert`
  (`onConflict: "day,user_id"`), so there's no separate edit flow to build.
- **`daily_stats` is a view**, not a synced counter column. `participant_count`
  is `count(testimonies)` per day; it's always correct by construction and
  needs no triggers to keep in sync.
- **Brightness formula** (spec: 0–50 scale, 0 = silhouette, 50 = 100%
  participation):

  ```sql
  brightness = least(50, greatest(0, round(50.0 * participant_count / total_members)))
  ```

  `total_members` lives in `stake_settings` so a clerk can correct the stake's
  member count without a code change. The identical formula is implemented in
  TypeScript at `src/lib/background.ts#brightnessFromCount` for demo mode.

## 3. Auth & roles

- **Production**: Supabase Auth, password-based (`/login`) — members create
  an account once and sign in with email + password afterward, no email
  required per visit. A "forgot/first time" link sends a one-time
  password-set link (`/auth/reset-password`), used both for real password
  recovery and for the one-time step of adding a password to an account that
  didn't have one yet. A `handle_new_user()` trigger creates a `profiles`
  row on first sign-in,
  defaulting to `role = 'member'`. You promote the first admin manually with
  one SQL statement (see the bottom of `schema.sql` and DEPLOYMENT.md) — there
  is intentionally no self-serve "become admin" button anywhere.
- **RLS enforces the role**, not the client. `testimonies` DELETE is
  `admin`-only at the database level (`is_admin()` policy); a `profiles`
  update trigger (`prevent_role_escalation`) silently reverts any attempt by a
  non-admin to change their own `role` column, even if they hand-craft a
  request. The React admin route (`/admin`) is a UX convenience, not the
  security boundary.
- **Demo mode**: there's no backend to enforce anything, so `src/lib/session.ts`
  is a small localStorage-based shim — a random member id is minted on first
  visit, and a "Preview Admin (demo)" button flips a `role` flag purely for
  exploring the `/admin` UI. This is clearly labeled in the UI and in code
  comments; it must never be mistaken for the real access-control mechanism.

## 4. Dynamic background system (spec 2.A)

`src/lib/background.ts#getDayTheme(day)`. Rather than sweeping hue linearly
across 33 days (which tends to pass through muddy or cold-looking colors), the
palette is anchored at five hand-picked keyframe days that tell a warm visual
story — **dawn blush → golden morning → full daylight → soft dusk → radiant
conference-day finale** — and every day in between is linearly interpolated
(in RGB space) between its two nearest keyframes. This guarantees every one of
the 33 days is visually distinct while the whole arc stays inside the warm,
soft palette the spec calls for.

`BackgroundLayer.tsx` renders two stacked, always-mounted gradient layers and
crossfades their `opacity` (never animates `background-image` directly), which
is what makes the transition smooth across browsers when the active day
changes. The active day defaults to the visitor's real current journey day,
but temporarily previews the hovered/focused day's theme for extra
interactivity.

## 5. Fruit brightness scale (spec 2.B)

`src/lib/background.ts#getFruitVisual(brightness)` interpolates through three
color stops — dark silhouette (`#55555c`) → warm visible apple (`#e2544b`) →
radiant white-gold (`#fff4d6`) — driving both the SVG fill and a CSS
`drop-shadow` glow whose blur radius and opacity scale with brightness. At
brightness 0 the fruit reads as an outline; at 50 it's a glowing highlight,
matching the spec's "dark silhouette → radiant glow" description exactly.

## 6. Fruit layout

33 fixed coordinates aren't hand-authored. `src/lib/fruitLayout.ts` places
fruit using a **phyllotaxis (sunflower-seed) distribution** mapped into the
canopy's ellipse — the same pattern nature uses to pack seeds evenly. This
gives an organic, non-overlapping cluster for any count without manual tuning,
and it's fully deterministic (same 33 positions every render).

## 7. Realtime data flow

```
Member submits testimony
      │
      ▼
supabase.from('testimonies').upsert(...)      (RLS: user_id = auth.uid())
      │
      ▼
Postgres commits ── Realtime broadcasts a postgres_changes event
      │                                   │
      ▼                                   ▼
daily_stats view is now current    Every subscribed client's
(read fresh on next query)         `useDayStats` / `useTestimonies` /
                                    `useAllTestimonies` hook (dataService.ts)
                                    re-fetches and re-renders — the Tree,
                                    the open TestimonyModal, and the admin
                                    dashboard all update within ~1s, with
                                    no manual refresh.
```

In demo mode the same hooks read `mockStore.ts` through `useSyncExternalStore`,
so a submission in one tab updates every other open tab/component instantly
via a plain in-memory pub/sub — the component code doesn't know or care which
mode it's in.

## 8. Admin panel (spec 2.E)

Route: `src/app/admin/page.tsx`, client-rendered, gated by `session.role`.

- **Reporting**: `useAllTestimonies()` + `useMemberRoster()` (both reactive,
  live-updating) feed a stat row (registered members, unique participants,
  testimonies submitted, overall participation %), a filterable testimony
  table (Day / Member name / Date filters, combined client-side over the
  already-fetched set — trivial at stake scale), and a member roster table
  (days completed, last submission).
- **Word export** (`src/lib/exportDocx.ts`): builds a `docx.Document` grouped
  by day — each section is `Day # — date`, then `Speaker — Talk Title`, then
  one paragraph per `Member: testimony text` — and downloads it client-side
  via `file-saver`. The export always operates on the **currently filtered**
  table, so a leader can export "just Day 12" or "just Sister Lee's
  testimonies" as easily as the full report.
- **Reset controls**: "reset one day" and "reset all 33 fruits" both route
  through `adminResetDay` / `adminResetAll` in `dataService.ts`, which in live
  mode is a `DELETE FROM testimonies WHERE ...` — allowed only by the
  admin-only RLS delete policy — and in demo mode clears the relevant
  localStorage rows. Both are gated behind `ConfirmDialog` (a real modal, not
  `window.confirm`) so a misclick can't wipe a day's testimonies silently.

## 9. Frontend file map

```
src/lib/
  schedule.ts       33-day mission data (dates only — weekday always derived, never hardcoded)
  types.ts          shared TS types
  background.ts     day-theme + fruit-brightness color systems
  color.ts          hex/rgb interpolation helpers
  fruitLayout.ts     phyllotaxis fruit positions
  roster.ts         shared member-roster reducer (used by mock + live)
  session.ts        demo-mode "auth" (localStorage)
  useSession.ts     React hook over session.ts
  dataService.ts    the ONE module components import for data — mock/live switch lives here
  supabase/client.ts   Supabase client factory + isSupabaseConfigured
  exportDocx.ts     admin Word-report generator

src/data/mockStore.ts   localStorage-backed demo database

src/components/
  Tree.tsx, FruitNode.tsx, FruitTooltip.tsx   the tree + 33 interactive fruit
  DailyCardList.tsx                            horizontal 33-day schedule carousel
  TestimonyModal.tsx                           read-all + submit modal
  BackgroundLayer.tsx                          crossfading daily gradient
  ConfirmDialog.tsx                            reusable destructive-action confirm

src/app/
  page.tsx            main tree experience
  admin/page.tsx       admin dashboard
  layout.tsx, globals.css

supabase/
  schema.sql, seed.sql
```
