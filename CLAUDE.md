# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev     # Run Convex dev server + Next.js dev server concurrently
pnpm build   # Production build
pnpm lint    # ESLint + Prettier validation
pnpm test    # Playwright end-to-end tests
```

Specs sit next to what they exercise — `src/components/Table.spec.ts` for `Table.tsx` — so `testDir` is `./src` and Playwright's default `**/*.spec.ts` match finds them. Shared fixtures (a per-test room, a dealer page, a joined player) live in `test/fixtures.ts` and need a live Convex dev server; the specs that drive the `/test/*` pages instead (`Board`, `Card`, `DealerButton`) import `@playwright/test` directly and need only `next dev`, which Playwright starts itself, reusing a running server outside CI. `Card.spec.ts` holds the screenshot test — update snapshots with `pnpm test -u`. Specs stay out of `src/pages/`, which is the only place Next routes from — `pageExtensions` defaults to `ts`/`tsx`, so a `board.spec.ts` under `pages/` would become the route `/test/board.spec` and fail `next build` for want of a default export.

## Toolchain

Node is pinned to 24.20.0 LTS (`.node-version`, `engines`). pnpm 11 is pinned via `packageManager`; Vercel honors it through `ENABLE_EXPERIMENTAL_COREPACK=1`, set on the project. `pnpm-workspace.yaml` needs its `packages:` field — pnpm 9, the version Vercel falls back to, errors without it.

`vercel.json` overrides the build command (the dashboard setting still said `yarn build`) with `convex deploy --cmd 'pnpm build'`, so Vercel — and only Vercel — pushes the schema. Don't fold that into `package.json`'s `build`: `convex deploy` targets the *production* deployment whenever `CONVEX_DEPLOYMENT` is set, which it is in `.env.local`, so a local `pnpm build` would publish. Convex runs `--cmd` first and pushes last, but any failed step fails the command, so a deployment that went live is one whose schema landed.

TypeScript is held at 6.x: typescript-eslint hard-errors on TS 7 and takes the whole lint run down ([#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)).

## Architecture

This is a Next.js + Convex real-time poker app (similar to Bold Poker). Players join a table on their phones; the dealer view shows community cards on a separate screen.

**Routing:** `src/pages/index.tsx` is a dead landing page — a fixed board and the welcome card, no Convex hooks, so it never opens a socket and stays static. `src/pages/[table].tsx` is the live one, rendering `Game.tsx`; `?table` forces the table view and is stripped from the URL on arrival. It's server-rendered only so the crawler's HTML can name the table in `og:image` — `/:table` was statically prerendered before, and every table served identical markup. Its `Cache-Control` lives in `next.config.js`, not the page.

**Views:**

- `Game.tsx` — session/join orchestration; routes to `Table` or `Hand` based on whether a seat param exists
- `Table.tsx` — dealer view, shows community board cards with reveal animations
- `Hand.tsx` — player view, drag gestures to reveal/fold hole cards
- `Card.tsx` — card with 3D flip animation; renders suit/rank SVG

**Backend (Convex):**

- `convex/schema.ts` — two tables: `deals` (community cards) and `players` (active seats)
- `convex/deals.ts` — `deal`, `clear` mutations; `get` query (latest deal for a table)
- `convex/players.ts` — `join`, `ping` mutations. Nothing is ever deleted: `join` reads only the live range off `byLastSeen` and stale rows simply aren't counted, so `ping` can be a bare `db.patch` that can't miss. A player is its document id, kept in `sessionStorage`; handing that id back to `join` revives the row and keeps the seat unless someone live has taken it.

**Key libraries:** `react-spring` (animations), `@use-gesture/react` (drag), `d3-array` (`shuffle`/`cross` for deck generation)

**Path alias:** `@/*` → `./src/*`

## No junk

Don't add speculative meta tags, config, or code "just in case" (og:title/og:description duplicating title/description, unused fallback logic, etc.). If it's not solving a real, current problem, leave it out — it's not worth the review time.

## Style

Comments are rare and load-bearing. `// Ping` over a ping loop, or `// Stale rows are left alone` over a query that visibly leaves them alone, is noise — rename the thing instead. What earns a comment is what the code can't say: `// query.table is the path segment here, so the flag has to come off the raw url` names a trap, `// not immutable: a sixth back reshuffles hash(table) % designs.length` names a constraint.

Inline anything with one call site. A helper called once is indirection, not abstraction.

Name a local for what it is, not for its relationship to the caller: `previous`, `returning`, `active`, `seats` — not `mine`, `live`, `taken`.

Let a real fork read as a fork. Two symmetric branches that both return — patch an existing row, or insert a new one — are `if`/`else`, not an early return that makes the first one look like a guard clause.

Return Convex ids as ids. `{ id: returning._id, table, seat }`, never `.toString()` — stringifying discards the brand and forces an `as Id<"players">` cast at every call site. Name the local `id` so the literal can use shorthand: `const id = await db.insert(...)` then `{ id, table, seat }`.

No blank lines inside a short function. A dozen-line handler is one block; paragraph breaks imply a structure it doesn't have.

Reach for what exists before inventing. The Convex document id is already a durable player identity; a parallel client id was duplication. `sessionStorage` is per-tab **on purpose** — two tabs are two players — so don't "upgrade" it to `localStorage`.

Playwright assertions take the default 5s. Don't pass `{ timeout: 10_000 }`; padding hides a slowdown instead of failing on it. The few remaining ones are leftovers, not a pattern.

Prefer deleting a mechanism over adding one around it. The stale-player crash was fixed by removing the sweep, not by catching its fallout; `/0` became `?table` by dropping a route segment, not by adding a redirect.

Don't commit or push unless asked.

The app exists to make in-person poker better, so features that replace what the room already does — player names, dealer button rotation, chips, betting — are anti-real-life and stay out. See "Deliberately not doing" in `TODO.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
