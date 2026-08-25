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

/** First range that covers the table size wins, so put the narrow ones first. */
type Note = { players: [number, number]; text: string };

export const noteFor = (index: number, players: number) =>
  rankings[index].notes?.find(
    ({ players: [lo, hi] }) => players >= lo && players <= hi,
  )?.text;

export const rankings: {
  name: string;
  notes?: Note[];
  deal: (r: Random) => Hand;
}[] = [
  {
    name: "Royal flush",
    notes: [
      { players: [1, 1], text: "Once every 20 years of weekly games." },
      { players: [2, 10], text: "Even ten players wait years between them." },
    ],
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
    notes: [
      { players: [1, 1], text: "About one every couple of years." },
      { players: [2, 5], text: "Somebody’s, about once a year." },
      { players: [6, 10], text: "Somebody’s, a few times a year." },
    ],
    deal: (r) => {
      const s = pick(r, suits);
      return { made: straight(r, 8).map((x) => x + s), kickers: [] };
    },
  },
  {
    name: "Four of a kind",
    notes: [
      { players: [1, 1], text: "Two or three a year." },
      { players: [2, 5], text: "Somebody’s, several times a year." },
      { players: [6, 10], text: "Somebody’s, most months." },
    ],
    deal: (r) => {
      const x = pick(r, ranks);
      return { made: suits.map((s) => x + s), kickers: kick(r, [x], 1) };
    },
  },
  {
    name: "Full house",
    notes: [
      {
        players: [6, 10],
        text: "At a full table someone’s boat is about as likely as someone’s flush.",
      },
      {
        players: [1, 10],
        text: "Half of all boards pair — and on those, full houses outnumber flushes more than two to one.",
      },
    ],
    deal: (r) => {
      const [a, b] = some(r, ranks, 2);
      return { made: [...set(r, a, 3), ...set(r, b, 2)], kickers: [] };
    },
  },
  {
    name: "Flush",
    notes: [
      {
        players: [1, 1],
        text: "Most nights, once. Flop four to a suit and you get there about a third of the time.",
      },
      {
        players: [2, 10],
        text: "Flop four to a suit and you get there about a third of the time.",
      },
    ],
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
    notes: [
      {
        players: [1, 10],
        text: "More common than high card by the river — and it still wins.",
      },
    ],
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
    notes: [
      {
        players: [1, 6],
        text: "Peaks on the turn: the river keeps promoting pairs to two pair.",
      },
      {
        players: [7, 10],
        text: "Past six players the peak moves to the flop — someone has a pair nearly every hand.",
      },
    ],
    deal: (r) => {
      const x = pick(r, ranks);
      return { made: set(r, x, 2), kickers: kick(r, [x], 3) };
    },
  },
  {
    name: "High card",
    notes: [
      {
        players: [1, 1],
        text: "Half of all flops. Rarer by the river — seven cards are hard to keep unpaired.",
      },
      {
        players: [2, 4],
        text: "Often somebody is playing nothing at all.",
      },
      {
        players: [5, 10],
        text: "About half of hands, somebody is playing nothing at all.",
      },
    ],
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
