import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  deals: defineTable({
    table: s.string(),
    cards: s.array(s.string()),
    board: s.array(s.string()),
    shuffled: s.array(s.string()),
    cleared: s.boolean(),
  }).index("byTable", ["table", "_creationTime"]),
  players: defineTable({
    table: s.string(),
    seat: s.number(),
    lastSeen: s.number(),
  }).index("bySeat", ["table", "seat"]),
});
