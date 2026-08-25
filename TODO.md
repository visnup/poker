# TODO

Feature backlog for Poker dance, roughly in the order worth doing them.
Effort is a rough sizing, not a promise.

## P-1 — traffic

Nobody is going to find this by accident. The share loop is already the whole
app — every table is a URL someone sends to the people sitting next to them —
so the cheap wins are all about making that link, and the domain behind it,
survive contact with an audience.

Roughly easiest-and-organic first.

- [x] **Title the page "Poker dance".** Was `<title>Poker</title>`, which
      competes with every poker site on earth and matches nothing anyone would
      type to find *this*. The name is the only distinctive string we own —
      and it's the tab label on the TV. `_app.tsx:16`, plus the `<h1>` on the
      welcome card (`Welcome.tsx:10`).
- [x] **An `og:image` so a shared link isn't a grey box.** Not static in the
      end: `/api/og` renders that table's own card back — design, palette, and
      the face `familyFor` picks — beside the table name, so `/jade` and
      `/cedar` preview as themselves. `next/og` ships inside Next, but Satori
      needs raw font bytes rather than `next/font`, hence `src/fonts`. The
      catch was `/:table` being statically prerendered, so every table served
      identical HTML and no per-table tag was possible; that's what
      `getServerSideProps` is for. Only `og:image` and
      `twitter:card=summary_large_image` — Slack and a preview tool both fall
      back to `<title>` and `<meta description>`, so the rest of the OG family
      stayed out. *Verified in production.*
- [ ] **Say "poker.dance" out loud in the room.** The table screen shows a join
      link in the help overlay; the domain isn't on screen otherwise. Someone
      photographing the TV should end up with the URL in the shot. *(XS)*
- [ ] **Post it where in-person poker people are.** r/poker, r/homepoker,
      Hacker News ("Show HN"), the boardgame-adjacent corners of Bluesky/Mastodon.
      One good post outperforms months of SEO for a thing like this, and it
      costs an evening. Gate on the demo video below — a visual app posted
      without a video reads as vaporware. *(S, recurring)*
- [ ] **Demo video, everywhere — not just the README.** Already tracked in P1;
      note here that the same WebM/GIF is the payload for every post, tweet,
      and app-store-style listing. Record once, reuse. *(see P1)*
- [x] **Make the landing page say what it is above the fold.** Already was,
      once `/` stopped being a live table: the welcome card renders
      server-side, so `<h1>♠ Poker Dance 💃</h1>` and the tagline are in the
      HTML a crawler gets, above a board and a Start a table button — the one
      line, one image, one button this asked for. The tagline is one exported
      string feeding the `<meta description>`, the card, and the `og:image`,
      so the three can't drift. Dropped the × from the welcome card: every
      way of dismissing it deals a hand, so an affordance promising a page
      behind it was a lie.
- [x] **Rules pages that deal, not diagram.** `/learn/hand-rankings` — every
      other rankings page on the internet is a table of card images; this one
      deals from the real deck with the same `Card` the tables use, kickers set
      past a gap, tap a row for another example. The generator is
      `src/lib/hands.ts`, checked by `hands.spec.ts` against a classifier that
      shares no code with it.
      - Odds run flop / turn / river, which in hold’em is just 5, 6 and 7
        cards seen — so the 5-card table every site copies is finally labelled
        as what it is. A chooser swaps "your hand" for "someone at the table".
        One player is exact; more are simulated, because hands at a table share
        a board and aren’t independent (`test/odds.mjs`).
- [ ] **The rest of `/learn`.** No index page — `/learn` itself stays a table
      name. Roughly in order of how much they teach:
      - **Pot odds.** The most useful thing a beginner can learn and the natural
        pair with the draw numbers: it costs 20 to win 100, you need 17%, your
        flush draw is 35%, so call. A calculator dealing real cards, with the
        rule of 4 and 2 shown next to the true number (9 outs: 36 vs 35.0). *(M)*
      - **Which hand wins?** The drill — two hands and a board, you pick, it
        flips and highlights the winning five, then deals another. Needs the
        evaluator that is **winner detection** in P2, so building it here gets
        showdown for free. The feedback loop is the part a reference can’t
        copy. *(M–L)*
      - **What’s out there?** Deal a board, then read the table against
        that texture. Half of all boards pair, and on a paired board full houses
        outnumber flushes more than two to one — measured, not folklore. Teaches
        reading a board rather than reading your own cards. *(M)*
      - **Flopping three to a suit.** Different lesson from flopping four: you
        need both remaining cards, so a suited *board* is scarier than suited
        hole cards. Currently unmeasured. *(S)*
      - **How a hand plays.** Blinds, the order of the streets, who acts — the
        vocabulary the other pages assume. The scroll-driven board that walks
        flop → turn → river belongs here, not on the rankings page. *(M)*
- [ ] **Own "poker without cards" / "phone poker deck" / "poker night no deck".**
      Long-tail searches by exactly the person who wants this — someone whose
      deck is missing at 9pm. A short page or a README section answering that
      literal question is most of the work. Unverified: whether these have any
      volume at all; check before writing copy for them. *(S)*
- [ ] **Ask the people who already played.** Everyone who has sat at a table is
      a person who could run one at their next game night. There's no email, no
      account, and nothing to ask them with — the lowest-friction version is a
      "star this on GitHub" or "share poker.dance" line in the help overlay
      after a session, not a signup. *(S)*
- [ ] **Actually read the analytics before doing any of this.** `@vercel/analytics`
      is already wired up in `_app.tsx`. Nobody has looked. How many tables get
      created, how many get a second player, how many get past the first deal —
      that ratio decides whether the problem is traffic or the first thirty
      seconds of the app. *(XS)*
- [ ] **Ship it to the Bold Poker crowd.** The README already credits Bold
      Poker; its users are the exact audience and it's iOS-only. A web version
      that needs no install is a real pitch to anyone who has searched for it.
      Where they congregate is unverified — find out first. *(S)*
- [ ] **Make a table name something to show off.** Word-based tables
      (`/raven`) are already memorable; a table that renders its own name
      nicely on the big screen is something people photograph and post. Free
      distribution from a feature that is mostly typography. *(S)*
- [ ] **Ambitious: make the app work for remote play.** The single biggest
      addressable-audience change, and the one thing the "deliberately not
      doing" list is built against — hidden hole cards, spectators, voice.
      Listed here only to name the tradeoff honestly: it multiplies the
      potential audience and subtracts the thing that makes the app good. *(XL,
      probably no)*

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
- [x] **Stop deleting players; let stale rows sit.** `join` used to delete every
      row unseen past the window across *all* tables, so a stranger's join freed
      your seat and left `ping` patching a row that no longer existed. Nothing
      is deleted now: `players` is indexed `["table", "lastSeen"]` and `join`
      reads only the live range, so stale rows cost nothing and simply aren't
      counted. `ping` is a bare `db.patch` again — with nothing deleted it can't
      miss.
      - Identity stays the Convex document id in `sessionStorage`; a reload
        hands that id back to `join`, which revives the row and keeps the seat.
        Per-tab is deliberate — two tabs are two players.
      - An id belonging to another table is ignored, so opening a second table
        in one tab no longer costs the first its seat.
      - A returning player only reclaims its old seat if no live row holds it,
        otherwise it's moved to a free one. *Verified against dev: phone at
        seat 1 goes quiet, a latecomer takes seat 1, the phone comes back at
        seat 2 on its original row.*
      - Still open: nothing reclaims a seat across *sessions* — a reopened app
        is a new `sessionStorage` and a new seat, leaving the old row behind.
        That's the tradeoff of per-tab identity, not a bug to fix.
      - What to do with rows nobody comes back to is undecided. They're cheap
        and never read, so there's no pressure to decide.

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
- [x] **Fill the blank screens.** Not three screens in the end — one status
      line. `Game` used to `return null` until `join` resolved, so every
      undecided state was the same blank page. The line at the bottom that had
      been printing `seat:id` is now that state, saying "joining…" or "every
      seat is taken" and otherwise staying `seat:id`. These states last a few
      hundred milliseconds and swapping whole screens would strobe, so the line
      fades in over a second instead: one that resolves on its own is a shadow
      before the text moves on.
      `Table` needed nothing — it auto-deals when there's no deal, and the
      dealer button and hint are on screen the whole time.
      - Rendering *anything* before `join` came back turned up two latent SSR
        crashes that `return null` had been hiding: `Help` read `location`
        during render, and `Table` reached `localStorage` through
        `useLocalStorageState`. `Help` now fills the join link in an effect;
        the views still wait for a player, so only the status line is
        server-rendered.
      - A phone with no deal to show says nothing. The first device on a table
        takes seat 0 and deals immediately, so the only way to sit at a table
        with no deal row is for that device to leave inside the 30s window —
        rare enough that the line would have been dead text.
- [x] **Say something when the table is full.** `players.join` scans seats
      `0..10` — seat 0 is the table screen, so ten hands — and returns `null`
      when they're all taken. `Game` distinguishes that from the `undefined` it
      holds while joining, so the eleventh player reads "every seat is taken"
      instead of staring at a blank page. `Game.spec.ts` seats eleven tabs in
      one context (`sessionStorage` is per-tab, so tabs are players) and checks
      the twelfth is told.
      - *Verified by firing 14 simultaneous joins at one fresh table, three
        times: seats 0–10, all unique, plus three refusals. Convex mutations
        are transactional and OCC-retried, so concurrent joins do not collide
        on a seat.*
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
      highlight the winner on the table view. Pure function, easy to unit test —
      and the same evaluator the rules pages in P-1 need, which is the one
      argument for writing it before there's a showdown to use it on. *(M)*
- [ ] **Sync reveal state across viewers.** `revealed` is `useState` local to
      one `Table`. Two dealer screens (or a reload mid-hand) disagree about
      whether the flop is out. Move it into the `deals` row. *(S)*
- [x] **Screen wake lock on the table view.** The dealer screen going to sleep
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
- [ ] **Dark mode inverts the card instead of dimming the room.** `card.ts:62`
      swaps the paper for `darkPaper` and the ink for a *light* `darkInk`, so
      the card flips while the felt only darkens partway — `darkslategray`
      (L 0.068) ends up brighter than all six dark papers (L 0.012–0.033), and
      the felt becomes the figure with the cards as holes cut in it. Light mode
      is 4.25:1, white on seagreen; dark is 1.42:1 the wrong way round, and
      `#333` paper can't beat 1.66:1 against even pure black, so no background
      colour fixes this while the paper stays that dark. A card doesn't turn
      charcoal when the lights go down. `lightOnly` (`card.ts:53`) already
      stops the swap and nothing passes `true`: flipping it gives white on a
      deepened seagreen (13:1, glary on a phone at night), or make `darkPaper`
      the paper *dimmed* rather than inverted (`#d7dbd4`, 7.8:1). Either way
      the two modes should agree on which is figure and which is ground; they
      needn't match ratios, since landing dark mode on 4.25:1 takes a mid-grey
      card that reads as cardboard. Flipping `lightOnly` leaves `darkInk` and
      `darkPaper` dead in all six palettes. *(S)*
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
- ~~**Scoping stale-player cleanup to the table.**~~ The argument was that stale
  is stale wherever it lives. True for garbage, but it made a stranger's join
  the thing that freed *your* seat — see the P0 above, which deletes nothing at
  all and drops the question.
- **Player names and dealer button rotation.** Both are anti-real-life. Everyone
  at the table already knows who's who and whose deal it is; typing your name
  into a phone and watching a screen keep track of the button replaces something
  the room does better with a worse copy. Same argument as chips below, which is
  the tell — anything that reimplements what being in the room already gives you
  is out.
- **Chips and betting.** Same philosophy as Bold Poker: this app exists to make
  real-life, in-person poker more fun, and the advantages of being in the room
  are things to depend on and leverage, not to reimplement. Betting happens with
  real chips across a real table. Digital stacks, pots, and betting rounds would
  replace the best part of the game with a worse copy of it.
