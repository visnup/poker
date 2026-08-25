import { expect, test } from "@playwright/test";
import { dealRanking, rankings } from "./hands";

const ranks = [..."23456789", "10", ..."JQKA"];
const rank = (card: string) => ranks.indexOf(card.slice(0, -1));

// deliberately shares nothing with the generator — if both were wrong the same
// way this would pass
function classify(cards: string[]) {
  const counts = new Map<number, number>();
  for (const c of cards) counts.set(rank(c), (counts.get(rank(c)) ?? 0) + 1);
  const shape = [...counts.values()].sort((a, b) => b - a).join("");
  const flush = new Set(cards.map((c) => c.slice(-1))).size === 1;
  const i = [...counts.keys()].sort((a, b) => a - b);
  const straight = i.length === 5 && i[4] - i[0] === 4;
  if (flush && straight) return i[4] === 12 ? "Royal flush" : "Straight flush";
  if (shape === "41") return "Four of a kind";
  if (shape === "32") return "Full house";
  if (flush) return "Flush";
  if (straight) return "Straight";
  if (shape === "311") return "Three of a kind";
  if (shape === "221") return "Two pair";
  if (shape === "2111") return "Pair";
  return "High card";
}

rankings.forEach(({ name }, i) => {
  test(`deals a real ${name.toLowerCase()}`, () => {
    for (let seed = 0; seed < 400; seed++) {
      const { made, kickers } = dealRanking(i, seed);
      const cards = [...made, ...kickers];
      const dealt = `${cards.join(" ")} (seed ${seed})`;
      expect(cards, dealt).toHaveLength(5);
      expect(new Set(cards).size, dealt).toBe(5);
      expect(classify(cards), dealt).toBe(name);
    }
  });
});

test("kickers never make the hand", () => {
  rankings.forEach(({ name }, i) => {
    for (let seed = 0; seed < 200; seed++) {
      const { made, kickers } = dealRanking(i, seed);
      expect(made.length + kickers.length, name).toBe(5);
      // a kicker sharing a rank with the made hand would change what it is
      const madeRanks = new Set(made.map(rank));
      for (const k of kickers) expect(madeRanks.has(rank(k)), name).toBe(false);
    }
  });
});
