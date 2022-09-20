import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  deals: defineTable({
    cards: s.array(s.string()),
    board: s.array(s.string()),
    shuffled: s.array(s.string()),
    cleared: s.boolean(),
  }),
  players: defineTable({
    seat: s.number(),
    lastSeen: s.number(),
  }).index("bySeat", ["seat"]),
});
