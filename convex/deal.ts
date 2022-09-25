import { mutation } from "./_generated/server.js";
import { shuffle } from "d3-array";

const suits = [..."♣♦♥♠"];
const ranks = [..."23456789", "10", ..."JQKA"];
const deck = suits.flatMap((s) => ranks.map((d) => d + s));

export default mutation(async ({ db }, table: string) => {
  const shuffled = shuffle(deck.slice());
  const board = shuffled.slice(0, 5);
  const cards = shuffled.slice(5);
  db.insert("deals", { table, shuffled, board, cards, cleared: false });
});
