import { mutation } from "./_generated/server.js";
import { shuffle } from "d3-array";

const suits = [..."♣♦♥♠"];
const denominations = [..."23456789", "10", ..."JQKA"];
const deck = suits.flatMap((s) => denominations.map((d) => d + s));

export default mutation(async ({ db }) => {
  const shuffled = shuffle(deck.slice());
  const board = shuffled.slice(0, 5);
  const cards = shuffled.slice(5);
  db.insert("deals", { shuffled, board, cards });
});
