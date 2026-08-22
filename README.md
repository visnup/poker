# Poker dance ♠️💃

Play poker without cards. A web clone of [Bold Poker](https://www.boldpoker.net).

Chips stay real. This replaces the deck and all the shuffling, nothing else.
Players use their phones.

## Play

Everyone opens the same URL: the site plus any table name, e.g. <https://poker.dance/kitchen>.

The first device to open it becomes the table screen: put it where everyone can
see. iPads are great for this. Every device after that gets a seat.

Add `/0` to force a device to be the table screen: <https://poker.dance/kitchen/0>.
Other numbers are ignored; you always get the next free seat.

Table:

- Move the dealer button - deal a new hand
- Tap the board - cycle through flop, turn, river, hidden again

Your seat:

- Pull down - peek at your cards
- Swipe down - reveal your cards
- Swipe up - fold
- Tap after folding - take back your cards (undo fold)

## Develop

```bash
pnpm dev    # Convex + Next
pnpm test   # Playwright
```
