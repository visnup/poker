import { v } from "convex/values";
import { cross, shuffle } from "d3-array";
import { mutation, query } from "./_generated/server.js";

const suits = [..."♣♦♥♠"];
const ranks = [..."23456789", "10", ..."JQKA"];
const deck = cross(ranks, suits, (r, s) => r + s);

export const clear = mutation({
  args: { table: v.string() },
  handler: async ({ db }, { table }) => {
    const dealt = await db
      .query("deals")
      .withIndex("byTable")
      .filter((q) => q.eq(q.field("table"), table))
      .order("desc")
      .first();
    if (dealt) await db.patch(dealt._id, { cleared: true });
  },
});

export const deal = mutation({
  args: { table: v.string() },
  handler: async ({ db }, { table }) => {
    const shuffled = shuffle(deck.slice());
    const board = shuffled.slice(0, 5);
    const cards = shuffled.slice(5);
    db.insert("deals", { table, shuffled, board, cards, cleared: false });
  },
});

export const get = query({
  args: { table: v.string() },
  handler: async (ctx, { table }) =>
    ctx.db
      .query("deals")
      .withIndex("byTable")
      .filter((q) => q.eq(q.field("table"), table))
      .order("desc")
      .first(),
});
