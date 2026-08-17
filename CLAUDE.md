# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev     # Run Convex dev server + Next.js dev server concurrently
pnpm build   # Production build
pnpm lint    # ESLint + Prettier validation
```

No automated test framework is configured. Manual testing is done via `/test/deal` and `/test/faces` routes while `npm run dev` is running.

## Architecture

This is a Next.js + Convex real-time poker app (similar to Bold Poker). Players join a table on their phones; the dealer view shows community cards on a separate screen.

**Routing:** `src/pages/[[...params]].tsx` captures `/:table` (dealer) and `/:table/:seat` (player) URLs and renders `Game.tsx`.

**Views:**
- `Game.tsx` — session/join orchestration; routes to `Table` or `Hand` based on whether a seat param exists
- `Table.tsx` — dealer view, shows community board cards with reveal animations
- `Hand.tsx` — player view, drag gestures to reveal/fold hole cards
- `Card.tsx` — card with 3D flip animation; renders suit/rank SVG

**Backend (Convex):**
- `convex/schema.ts` — two tables: `deals` (community cards) and `players` (active seats)
- `convex/deals.ts` — `deal`, `clear` mutations; `get` query (latest deal for a table)
- `convex/players.ts` — `join`, `ping` mutations; stale players (>10s) are auto-removed

**Key libraries:** `react-spring` (animations), `@use-gesture/react` (drag), `d3-array` (`shuffle`/`cross` for deck generation)

**Path alias:** `@/*` → `./src/*`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
