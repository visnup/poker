import { mulberry32 } from "./card";

const suits = [..."♠♥♦♣"];
const ranks = [..."23456789", "10", ..."JQKA"];
const rank = (card: string) => ranks.indexOf(card.slice(0, -1));

type Random = () => number;
type Hand = { made: string[]; kickers: string[] };

const pick = <T>(r: Random, xs: readonly T[]) =>
  xs[Math.floor(r() * xs.length)];
const some = <T>(r: Random, xs: readonly T[], n: number) => {
  const pool = xs.slice();
  return Array.from({ length: n }, () =>
    pool.splice(Math.floor(r() * pool.length), 1),
  ).flat();
};
const high = (cards: string[]) =>
  cards.slice().sort((a, b) => rank(b) - rank(a));

const set = (r: Random, of: string, n: number) =>
  some(r, suits, n).map((s) => of + s);
const kick = (r: Random, used: string[], n: number) =>
  high(
    some(
      r,
      ranks.filter((x) => !used.includes(x)),
      n,
    ).map((x) => x + pick(r, suits)),
  );

const straight = (r: Random, top: number) =>
  ranks
    .slice(Math.floor(r() * top))
    .slice(0, 5)
    .reverse();
const inARow = (cards: string[]) =>
  high(cards).every((c, i, a) => i === 0 || rank(c) === rank(a[i - 1]) - 1);
const oneSuit = (cards: string[]) =>
  new Set(cards.map((c) => c.slice(-1))).size === 1;

/** Retry until the hand isn't accidentally a better one. */
const until = (ok: (h: string[]) => boolean, make: () => string[]) => {
  let cards = make();
  while (!ok(cards)) cards = make();
  return cards;
};

export const rankings: {
  name: string;
  note?: string;
  deal: (r: Random) => Hand;
}[] = [
  {
    name: "Royal flush",
    note: "Once every 20 years of weekly games.",
    deal: (r) => {
      const s = pick(r, suits);
      return {
        made: ["A", "K", "Q", "J", "10"].map((x) => x + s),
        kickers: [],
      };
    },
  },
  {
    name: "Straight flush",
    note: "About one every couple of years.",
    deal: (r) => {
      const s = pick(r, suits);
      return { made: straight(r, 8).map((x) => x + s), kickers: [] };
    },
  },
  {
    name: "Four of a kind",
    note: "Two or three a year.",
    deal: (r) => {
      const x = pick(r, ranks);
      return { made: suits.map((s) => x + s), kickers: kick(r, [x], 1) };
    },
  },
  {
    name: "Full house",
    note: "Half of all boards pair — and on those, full houses outnumber flushes more than two to one.",
    deal: (r) => {
      const [a, b] = some(r, ranks, 2);
      return { made: [...set(r, a, 3), ...set(r, b, 2)], kickers: [] };
    },
  },
  {
    name: "Flush",
    note: "Most nights, once. Flop four to a suit and you get there about a third of the time.",
    deal: (r) => {
      const s = pick(r, suits);
      const made = until(
        (c) => !inARow(c),
        () => high(some(r, ranks, 5).map((x) => x + s)),
      );
      return { made, kickers: [] };
    },
  },
  {
    name: "Straight",
    deal: (r) => {
      const xs = straight(r, 9);
      const made = until(
        (c) => !oneSuit(c),
        () => xs.map((x) => x + pick(r, suits)),
      );
      return { made, kickers: [] };
    },
  },
  {
    name: "Three of a kind",
    deal: (r) => {
      const x = pick(r, ranks);
      return { made: set(r, x, 3), kickers: kick(r, [x], 2) };
    },
  },
  {
    name: "Two pair",
    note: "More common than high card by the river — and it still wins.",
    deal: (r) => {
      const [a, b] = some(r, ranks, 2).sort(
        (x, y) => ranks.indexOf(y) - ranks.indexOf(x),
      );
      return {
        made: [...set(r, a, 2), ...set(r, b, 2)],
        kickers: kick(r, [a, b], 1),
      };
    },
  },
  {
    name: "Pair",
    note: "Peaks on the turn: the river keeps promoting pairs to two pair.",
    deal: (r) => {
      const x = pick(r, ranks);
      return { made: set(r, x, 2), kickers: kick(r, [x], 3) };
    },
  },
  {
    name: "High card",
    note: "Half of all flops. Rarer by the river — seven cards are hard to keep unpaired.",
    deal: (r) => {
      const [top, ...rest] = until(
        (c) => !inARow(c) && !oneSuit(c),
        () => high(some(r, ranks, 5).map((x) => x + pick(r, suits))),
      );
      return { made: [top], kickers: rest };
    },
  },
];

export const dealRanking = (i: number, seed: number) =>
  rankings[i].deal(mulberry32(seed));
