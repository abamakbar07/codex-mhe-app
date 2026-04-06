# MHE App Base Scaffold

This project is a Next.js App Router starter with Supabase wiring.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Ensure `.env.local` has values for:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ROUTE_DISTANCE_METRIC` (`manhattan` or `euclidean`, defaults to `manhattan`)
3. In Vercel, go to **Project Settings → Environment Variables** and add the same keys for Preview and Production.
4. Run the app:
   ```bash
   pnpm dev
   ```

## Vercel preview checklist

Use this sequence before sharing a preview URL:

1. Confirm project link and login:
   ```bash
   vercel whoami
   vercel link
   ```
2. Confirm all required env vars are set in Preview:
   ```bash
   vercel env ls preview
   ```
   Required keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ROUTE_DISTANCE_METRIC`
3. Deploy preview:
   ```bash
   vercel --target preview
   ```

## Smoke test with seeded data

Seed rows are created by `supabase/migrations/20260406000000_create_locations_and_tasks.sql`.

1. Ensure the migration has been applied to your linked Supabase project.
2. Start the app (`pnpm dev`) and open `/`.
3. Validate baseline panel shows pending tasks in ascending `tasks.id` order.
4. Click **Recompute optimized route** and verify:
   - Ordered task IDs are shown.
   - `After Distance` is less than or equal to `Before Distance`.
   - Route map updates (baseline solid path, optimized dashed path in `Both` mode).
5. Change the metric selector from `manhattan` to `euclidean`:
   - A loading state appears while data is fetched.
   - Distances update for the selected metric.

## Demo script (short)

1. Open the dashboard and point out the **Distance metric** selector.
2. Switch from `manhattan` to `euclidean` and wait for the loading banner to clear.
3. Show **Baseline Task Sequence** ordering by task ID.
4. Click **Recompute optimized route**.
5. Call out **Improvement %** and toggle map visibility between **Baseline**, **Optimized**, and **Both**.
