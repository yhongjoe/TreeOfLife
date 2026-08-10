# Deployment Guide — 100% Free Tier

This deploys Tree of Light on Vercel (frontend) + Supabase (database, auth,
realtime), both on their free tiers. Total time: ~20 minutes.

You can also skip all of this and just run `npm run dev` — the app works
fully in local **demo mode** (localStorage, no backend) for exploring the UI.
This guide is for turning on the real multi-user backend.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier).
2. Pick a region close to your stake's members, set a database password
   (save it somewhere safe — you won't need it day-to-day, Supabase manages
   connections for you).
3. Wait for provisioning (~2 minutes).

## 2. Load the schema

1. In the Supabase dashboard, open **SQL Editor**.
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.
3. Paste the contents of [`supabase/seed.sql`](supabase/seed.sql) and run it —
   this loads the 33-day mission schedule (both scripts are safe to re-run).
4. Optional: update your stake's real member count so brightness reflects
   reality —
   ```sql
   update public.stake_settings set total_members = 180, stake_name = 'Example Stake';
   ```

## 3. Turn on email auth (magic link)

1. **Authentication → Providers**: confirm **Email** is enabled.
2. **Authentication → Sign In / Providers → Email**: turn **off** "Confirm
   email" only if you want frictionless first-time sign-in for a closed
   group; otherwise leave it on and members will click a link in their inbox.
3. **Authentication → URL Configuration**: set **Site URL** to your future
   Vercel URL (e.g. `https://tree-of-light.vercel.app`) — you can update this
   later once you know the real URL.

> The prototype's UI itself doesn't yet include the actual sign-in screen
> (magic-link email + callback route) — the frontend code in
> `src/lib/dataService.ts` is fully wired to call `supabase.auth.getUser()`
> on submit, but you'll want to add a simple `/login` page that calls
> `supabase.auth.signInWithOtp({ email })`. This is a small, standard addition
> — see [Supabase's Next.js auth guide](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
> for the exact snippet if you want members to actually authenticate rather
> than running purely in demo mode.

## 4. Get your API keys

**Project Settings → API**. You need:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Copy `.env.local.example` to `.env.local` and fill these in to test live mode
locally:

```bash
cp .env.local.example .env.local
npm run dev
```

## 5. Push to GitHub

```bash
git add -A
git commit -m "Tree of Light"
git branch -M main
git remote add origin https://github.com/<you>/tree-of-light.git
git push -u origin main
```

## 6. Deploy on Vercel

1. [vercel.com/new](https://vercel.com/new) → import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Add environment variables (same two as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Free tier is plenty for a single stake (generous bandwidth,
   automatic HTTPS, a `*.vercel.app` domain included).
5. Go back to Supabase **Authentication → URL Configuration** and update
   **Site URL** (and add a **Redirect URL**) to your real
   `https://<project>.vercel.app` address.

## 7. Promote your first admin

After you've signed in at least once on the deployed site (creating your
`profiles` row via the `handle_new_user` trigger), run in the SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

You'll now see the **Admin Panel** link in the header and can access `/admin`.

## 8. Verify realtime works

Open the site in two browser windows (or one normal + one incognito), submit
a testimony in one, and confirm the fruit brightness / participant badge and
the other window's open testimony modal update within a second or two without
a manual refresh. If not, double-check **Database → Replication** in Supabase
shows `testimonies` enabled (schema.sql's `alter publication` line does this
automatically, but it's worth a glance).

## 9. Updating the mission schedule later

The schedule is defined in two places that must stay in sync:
- `src/lib/schedule.ts` (drives all UI)
- `supabase/seed.sql` (drives the DB `missions` table + admin exports)

Edit both, redeploy the frontend, and re-run the updated `seed.sql` block (it
upserts on `day`, so it's safe to re-run).

## Free tier limits to be aware of

These change over time — check current numbers on each provider's pricing
page before your conference — but as of writing, both free tiers comfortably
cover a single stake (dozens to a few hundred members, 33 days of activity):

- **Supabase free tier**: one active project, a database sized in the
  hundreds of MB, tens of thousands of monthly active auth users, and a few
  GB of bandwidth/month. A project can pause after a week of total
  inactivity — if that happens, open the dashboard once to un-pause it.
- **Vercel Hobby tier**: generous monthly bandwidth and build minutes for a
  low-traffic project like this one; custom domains are supported for free.

No paid tier is required to run this for a stake conference.
