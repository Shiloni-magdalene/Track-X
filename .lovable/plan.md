# Phase 3 — Dashboard Command Center

Rebuild `src/routes/_authenticated/dashboard.tsx` as a modern, responsive command center with placeholder data matching the schema in `src/lib/types.ts`. No backend wiring yet — pure UI with static seed data.

## Dependencies

- Add `recharts` via `bun add recharts` (not currently installed).
- Reuse existing Shadcn primitives: Card, Progress, Badge, Checkbox, Separator, Avatar. Install any missing ones via shadcn CLI if needed (likely `checkbox`, `badge` — verify first).

## Layout

Single file, mobile-first grid inside the existing `<main>` from `_authenticated/route.tsx`:

```text
┌──────────────────────────────────────────────────────┐
│ Welcome hero (kept, condensed)                       │
├──────────┬──────────┬──────────┬──────────┐          │
│ Academic │ Placement│  Coding  │ Aptitude │  Row 1   │
│ Circular │ Circular │  Streak  │ Accuracy │          │
├──────────┴──────────┼──────────┴──────────┐          │
│ Weekly Goals (Bar)  │ Today's Tasks       │  Row 2   │
│ (lg:col-span-2)     │ (checkboxes)        │          │
│                     ├─────────────────────┤          │
│                     │ Recent Activity     │          │
├─────────────────────┴─────────────────────┤          │
│ Upcoming Deadlines │ Upcoming Exams       │  Row 3   │
└────────────────────┴──────────────────────┘          │
```

Grid: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` for Row 1; `lg:grid-cols-3` for Row 2 (bar chart spans 2, right column stacks Tasks + Activity); `lg:grid-cols-2` for Row 3.

## Row 1 — Quick Stats

Circular progress via lightweight inline SVG component (`CircularProgress` — stroke-dasharray on an SVG circle, uses `--primary` and `--muted`). Two circular cards: **Academic Progress** (68%), **Placement Readiness** (54%). Two numeric cards: **Coding Streak** (12 days, flame icon, `--warning` accent), **Aptitude Accuracy** (76%, `--success` accent, tiny sparkline optional — skip for now).

## Row 2

- **Weekly Goals Progress** — Recharts `<BarChart>` with 7 days (Mon–Sun), two series: `planned` vs `completed` (hours). Colors from `--chart-1` / `--chart-2`. Rounded bars, no grid lines except subtle horizontal, custom tooltip using card token colors.
- **Today's Tasks** — 4–5 items with Shadcn `<Checkbox>`, strike-through on check (local state), each with a small category badge (Academics / Coding / Aptitude).
- **Recent Activity** — vertical timeline (5 entries): dot + line via CSS, icon per event type (solved LeetCode, submitted assignment, mock test, certificate added, LinkedIn post). Relative timestamps ("2h ago").

## Row 3 — Alerts

- **Upcoming Deadlines** — list of 3–4 items from `projects`/`subjects` shape (name, due date, urgency badge: red ≤2 days, amber ≤7, muted otherwise).
- **Upcoming Exams** — list from `exams` shape (subject, type badge — CAT/Unit Test/EndSem, date, days-left urgency badge).

Both use `<div>` rows with hover `bg-accent/50` transition.

## Placeholder data

A single `dashboardMockData` object at top of the file, typed against `Project`, `Exam`, `Subject` from `@/lib/types.ts` (partial where fine). Keeps future swap to Supabase queries trivial.

## Polish

- All cards: `transition-all hover:shadow-md hover:-translate-y-0.5` for subtle lift.
- Use only semantic tokens (`bg-card`, `text-muted-foreground`, `border`, `--chart-*`) — no hardcoded colors, works in dark mode.
- Icons from `lucide-react` (Flame, Target, CheckCircle2, Clock, AlertCircle, CalendarDays, Trophy, Code2, Brain, etc.).
- Fully responsive: stat cards stack on mobile, chart full-width, side column drops below on <lg.

## Files touched

- `src/routes/_authenticated/dashboard.tsx` — full rewrite.
- `package.json` / lockfile — via `bun add recharts` (+ shadcn checkbox/badge if missing).

Not touched: routing, auth, database, other routes.
