import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  deals: defineTable({
    table: v.string(),
    cards: v.array(v.string()),
    board: v.array(v.string()),
    shuffled: v.array(v.string()),
    cleared: v.boolean(),
  }).index("byTable", ["table"]),
  players: defineTable({
    table: v.string(),
    seat: v.number(),
    lastSeen: v.number(),
  }).index("bySeat", ["table", "seat"]),
});
