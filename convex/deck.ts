import { cross } from "d3-array";

const suits = [..."♣♦♥♠"];
const ranks = [..."23456789", "10", ..."JQKA"];
export const deck = cross(suits, ranks, (s, r) => r + s);
