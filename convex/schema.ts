import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  deals: defineTable({
    cards: s.array(s.string()),
    community: s.array(s.string()),
    shuffled: s.array(s.string()),
  }),
  players: defineTable({ n: s.number(), t: s.number() }),
})
