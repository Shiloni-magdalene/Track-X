# Premium SaaS Redesign Plan

Goal: elevate the app to Linear/Vercel/Stripe-tier polish. **No backend, DB, server function, or AI logic changes.** Every module keeps its current data flow, CRUD, and Supabase queries. Only markup, styling, layout, motion, and small presentational components change.

Because this touches ~15 pages, I'll do it in **4 sequenced passes** so you can review after each — not one giant rewrite.

## Pass 1 — Design system foundation (this turn)
Everything below is presentation-only.

**Tokens (`src/styles.css`)**
- Rebuild palette on the exact hexes you gave: primary `#2563EB`, accent `#7C3AED`, success `#22C55E`, warning `#F59E0B`, danger `#EF4444`, refined neutral scale for light + dark.
- Tighter radii scale, softer elevation shadows (`--shadow-xs/sm/md/lg`), 8-pt spacing already native to Tailwind.
- Replace the loud brand gradient + glow with a restrained variant used sparingly.
- Add `--font-sans` (Inter) loaded via `<link>` in `__root.tsx` head.

**Primitives**
- `PageHeader` (title, description, actions slot) — used on every module for consistent hierarchy.
- `StatCard`, `SectionCard` wrappers with unified padding, hover lift, border treatment.
- `EmptyState` (icon, title, description, CTA) — replaces every ad-hoc empty block.
- `Skeleton` presets for cards / rows / charts.
- Motion helpers using existing `tw-animate-css` (no new deps) — subtle fade/slide-up on mount, hover lift on cards.

**Shell**
- Sidebar: grouped sections (Study, Placement, Tools), refined active indicator (left accent bar + subtle bg), smoother collapse, better icon spacing.
- Topbar: sticky, refined search input, quick-AI button (opens `/ai-assistant`), profile menu, theme toggle, notifications — all with consistent icon-button sizing.

## Pass 2 — Dashboard + AI Assistant
- Dashboard: executive command-center grid — welcome header, AI insight card, radial progress rings for the 4 KPIs, weekly goals area chart, upcoming deadlines/exams list, activity timeline, calendar preview. Skeleton loading, empty states.
- AI Assistant: ChatGPT-style layout — centered column, message bubbles with avatars, timestamps, markdown + syntax-highlighted code (add `react-syntax-highlighter`), copy button per assistant message, regenerate, refined suggested prompts, auto-scroll, skeleton while thinking. **Backend server fn untouched.**

## Pass 3 — Data-heavy modules
Academics, Exams, Aptitude, Coding, Placements, Projects.
- Consistent `PageHeader` + primary action.
- Cards → unified surface; tables get sticky headers, hover rows, search/filter where already applicable.
- Dialogs restyled with consistent form spacing, inline validation styling, better date/select controls.
- Empty states + skeletons everywhere.

## Pass 4 — Auth, notifications, polish
- Auth page: split-screen premium layout, refined form.
- Notifications popover: grouped by type, unread dot, refined empty state.
- Global sweep: focus rings, ARIA labels on icon buttons, responsive audit at 375/768/1280, remove any remaining hardcoded colors.

## Explicit non-goals
- No schema, RLS, server function, or AI prompt changes.
- No new heavy deps beyond `react-syntax-highlighter` (Pass 2) and Inter font.
- No Framer Motion — using existing `tw-animate-css` + Tailwind transitions keeps bundle lean and matches the "subtle, professional" brief. If you specifically want Framer Motion I'll add it in Pass 2.

## What I'll do right now if you approve
Pass 1 only: tokens, primitives, sidebar, topbar. You'll see the whole app instantly feel more consistent, then we move to Pass 2.

Reply "go" (or "go, use framer motion") to start Pass 1, or tell me to reorder/skip passes.
