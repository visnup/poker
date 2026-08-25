# Poker dance ♠️💃

Looking to play Texas hold ’em and nobody brought cards? Send everyone a link —
phones are the hands, the TV is the table, chips stay real. Nothing to install.

<https://poker.dance>

[demo.webm](https://github.com/user-attachments/assets/fe7e42b1-154b-40f5-884a-236b8dc20079)

## Play

Everyone opens the same URL: the site plus any table name, e.g. <https://poker.dance/kitchen>.

The first device to open it becomes the table screen: put it where everyone can
see. iPads are great for this. Every device after that gets a seat.

Add `?table` to force a device to be the table screen:
<https://poker.dance/kitchen?table>. It drops out of the address bar once
you're there, so the URL stays the one you'd hand around for seats.

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

Message or open issues if you’ve got ‘em.

## Inspiration

A web clone of [Bold Poker](https://www.boldpoker.net).
