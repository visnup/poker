# TODO

Feature backlog for Poker dance, roughly in the order worth doing them.
Effort is a rough sizing, not a promise.

## P0 — correctness & trust

Things that make the app wrong or unplayable as-is.

- [x] **Actually use the indexes.** `deals.get`, `deals.clear`, and
      `players.join` each named an index and then re-filtered on that index's
      own key in the app layer, so the index supplied ordering and nothing
      else. *Measured on the dev deployment (603 deals across 499 tables) by
      walking the index exactly the way `deals.get` did: 4 documents scanned
      for a table sorting late in the index, 527 for the earliest one, and all
      603 for a table with no deals yet — which is what every phone hits
      before the first deal. Ranged: 1.* At ~1KB a deal row that was also
      ~600KB read per call and climbing toward Convex's 16384-document / 8MB
      per-query ceiling. Now `withIndex("byTable", q => q.eq("table", table))`
      with no `.filter()`.
- [ ] **Keep a seat across sessions, not just reloads.** *Verified by running
      it: a same-tab reload keeps the seat and player id; a second browser
      context on the same table gets a new seat.* State lives in
      `sessionStorage` under one `"player"` key, so anything that starts a
      fresh session — reopening the app, a phone dropping the tab, a new
      window — burns a seat and the player comes back as someone else. Opening
      a second table in the same tab overwrites the key, so returning to the
      first burns one too. Move to `localStorage` keyed by table + a client
      id. *(S)*

## P1 — teaching people how to play

Every interaction in the app is an undocumented gesture. Nothing on screen says
the dealer button is draggable, that the board is clickable, or that a hand
responds to anything at all. Today the app is only usable by someone who already
knows Bold Poker — which is most of the way to unusable.

The full inventory of things a new player cannot discover:

| Where | Gesture | Code |
| --- | --- | --- |
| Table | Fling the dealer button >200px to clear + deal | `Table.tsx:56` |
| Table | Click the board to advance flop → turn → river (wraps back to hidden) | `Table.tsx:161` |
| Hand | Pull down >250px to peek at your cards | `Hand.tsx:47` |
| Hand | Swipe up to fold | `Hand.tsx:52` |
| Join | First device to open `/:table` becomes the shared screen (seat 0) | `Game.tsx:52` |

- [x] **A landing page at `/`.** Was a live table whose name was the empty
      string, shared by everyone who ever visited the bare domain. Now a
      dismissible welcome overlay explains the app and sends you to a random
      word-based table (`/raven`, `/tiger`) on dismiss. Doesn't yet let you
      type your own table name — that's still open if it turns out to matter.
- [x] **Gesture hints on first use.** Table view has a "share this link /
      move the dealer button to deal" caption, hand view has a matching
      "pull down to peek · swipe up to fold" caption. Both fade out on first
      use and stay hidden on reload via `localStorage` (`tableHint`,
      `handHint`) — see `Table.tsx`, `Hand.tsx`, `hints.spec.ts`.
- [x] **Help overlay.** A `?` at the end of the `Player` line, so it's on every
      screen rather than only the table. Opens a card listing the gestures for
      both roles and the join link. `Help.tsx`, `help.spec.ts`.
- [x] **QR code to join.** In the help overlay next to the join link, so people
      point a phone at the TV instead of typing a URL. Rendered as inline SVG
      from `qrcode-generator` (2.0.4, no deps) — dark modules on an explicit
      white plate so it still scans in dark mode.
- [ ] **Fill the blank screens.** `Game` renders `null` while joining, `Table`
      renders no board before the first deal, and a player's phone renders
      nothing at all until someone deals. Three different states that all look
      like a broken page. Add "connecting…", "fling the dealer button to
      start", and "waiting for the deal". *(S)*
- [ ] **Say something when the table is full.** `players.join` scans seats
      `0..10` — seat 0 is the table screen, so ten hands — and when they're all
      taken it falls out of the loop and returns `undefined`. `Game` stores
      that, `joining.current` is already `true` so nothing retries, and
      `if (!player) return null` leaves the eleventh player staring at a blank
      page forever. The fix isn't in `Hand`; `Hand` never mounts. `join` has to
      return the refusal — plain `undefined` is indistinguishable from "still
      joining" on the client — and `Game` has to render it. Same family as the
      blank screens above. *(S)*
      - *Verified by firing 14 simultaneous joins at one fresh table, three
        times: seats 0–10, all unique, plus three `undefined`s. Convex
        mutations are transactional and OCC-retried, so concurrent joins do not
        collide on a seat.*
      - The cap of ten is a poker-table choice, not a deck limit: `deal` leaves
        47 cards after the board and `Hand` indexes `(seat - 1) * 2`, so the
        deck would seat 23. Worth stating as a rule wherever the cap lands.
- [ ] **Record a demo video.** A hand dealt, a peek, a fold. `hand.spec.ts`
      already scripts all three gestures, so a Playwright recording script is
      mostly assembly — and re-runnable when the UI changes. WebM, no
      conversion: `recordVideo` writes `.webm` and nothing else (it throws on
      any other extension, `videoRecorder.js:38`). Embed at the top of the
      README; for a visual app it will outsell any copy. *(M)*
      - Unverified: whether GitHub's README renderer plays a `.webm` committed
        in the repo, or only ones uploaded to `user-attachments`. Check before
        assuming a relative path works.
- [ ] **Explain the two roles.** It's surprising that the first phone to open
      the URL becomes the table screen rather than a seat. Either label it on
      screen ("this device is the table") or make choosing explicit. *(S)*
- [ ] **Fix or drop numbered seat URLs.** Verified by running the routing
      logic: `[[...params]].tsx:9` maps only the literal `"0"` to a seat, so
      `/kitchen/1` silently auto-assigns instead of claiming seat 1, and `/1`
      is a table *named* "1". The path reads like `/:table/:seat` but the
      segment is really a boolean "is this the table screen". Either honor the
      number or rename the route. (`CLAUDE.md` describes it the old way too.)
      *(S)*
- [x] **README that covers actual use.** Table naming, which device is which,
      and the four gestures.

## P2 — the game people actually want to play

- [ ] **Reveal hole cards at showdown.** Right now a hand ends and nobody can
      prove anything. Let a player push their cards to the table view so the big
      screen shows them. This is the single biggest gameplay gap. *(M)*
- [ ] **Winner detection.** Evaluate the best 5-of-7 for revealed hands and
      highlight the winner on the table view. Pure function, easy to unit test.
      *(M)*
- [ ] **Sync reveal state across viewers.** `revealed` is `useState` local to
      one `Table`. Two dealer screens (or a reload mid-hand) disagree about
      whether the flop is out. Move it into the `deals` row. *(S)*
- [ ] **Dealer button rotation.** Track which seat has the button and advance it
      each hand. Not for digital blinds — so the table screen can show whose
      deal it is and who posts, while the chips stay real. *(S–M)*
- [ ] **Player names.** Prompt on join, show them on the table view around the
      board and next to revealed hands. Makes a shared screen legible. *(S)*
- [ ] **Screen wake lock on the table view.** The dealer screen going to sleep
      mid-hand is a guaranteed real-world annoyance. `navigator.wakeLock`. *(S)*

## P3 — polish

- [ ] **Show who's seated on the table view** — empty seats vs. occupied,
      updating live. *(S)*
- [ ] **Haptics and sound.** Vibrate on deal, a shuffle sound on the table view.
      Cheap and disproportionately good. *(S)*
- [ ] **PWA manifest + add-to-homescreen.** Full-screen on a phone, no browser
      chrome eating the card area. *(S)*
- [ ] **Spectator mode.** A read-only URL that shows the board without taking a
      seat. *(S)*
- [ ] **Accessibility pass.** Cards are drag-only with suit glyphs as text;
      there's no keyboard or screen-reader path to reveal or fold, and red/black
      is the only suit encoding. *(M)*
- [ ] **Table settings** — number of seats, whether folded hands stay hidden,
      reveal-on-fold. *(M)*
- [ ] **Card back / theme picker.** The Sol LeWitt back is generated from a
      seeded PRNG; exposing the seed is nearly free variety. *(S)*

## P4 — infrastructure

- [ ] **Test Convex functions directly.** `convex-test` unit tests for seat
      assignment, staleness, and dealing — none of that is covered today,
      and `hand.spec.ts` / `table.spec.ts` need a live Convex dev server to run.
      *(M)*
- [ ] **Deterministic shuffle seed for tests.** Lets Playwright assert on
      specific cards instead of just counts. *(S)*
- [ ] **Rate-limit `deal`.** Nothing stops a client from spamming the mutation.
      *(S)*

## Deliberately not doing

- **Hiding hole cards from other clients.** `deals.get` ships every hand and the
  full shuffled deck to every phone. The UI never renders another player's
  cards, so reading them takes devtools on a phone — not a threat around a
  kitchen table. Revisit only if this is ever played remotely, where the other
  players aren't in the room and a laptop is one alt-tab away.
- **Garbage-collecting old deals.** A deal row is ~1KB and a long night is a
  hundred hands; storage will never be the constraint. The only thing that made
  accumulation matter was the range-less `withIndex` scan above; that's fixed,
  so the rows can pile up indefinitely.
- **Scoping stale-player cleanup to the table.** `players.join` collects every
  player unseen for >10s across *all* tables and deletes them. Global, but
  stale is stale — those rows are dead wherever they live, and unlike `deals`
  the table self-prunes, so the scan is over roughly the number of people
  playing right now rather than a history that only grows.
- **Chips and betting.** Same philosophy as Bold Poker: this app exists to make
  real-life, in-person poker more fun, and the advantages of being in the room
  are things to depend on and leverage, not to reimplement. Betting happens with
  real chips across a real table. Digital stacks, pots, and betting rounds would
  replace the best part of the game with a worse copy of it.
