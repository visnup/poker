import { v } from "convex/values";
import { mutation } from "./_generated/server.js";

export const join = mutation({
  args: { table: v.string() },
  handler: async ({ db }, { table }) => {
    const now = Date.now();
    const recent = now - 30e3;

    // Remove stale.
    const stale = await db
      .query("players")
      .filter((q) => q.lt(q.field("lastSeen"), recent))
      .collect();
    for (const { _id } of stale) await db.delete(_id);

    // Find an available seat.
    const players = await db
      .query("players")
      .withIndex("bySeat", (q) => q.eq("table", table))
      .collect();
    for (let n = 0; n <= 10; n++)
      if (!players[n] || n < players[n].seat) {
        const player = { table, seat: n, lastSeen: now };
        const id = await db.insert("players", player);
        return { id: id.toString(), table, seat: n };
      }
  },
});

export const ping = mutation({
  args: { id: v.id("players") },
  handler: async ({ db }, { id }) => {
    if (!(await db.get(id))) return false; // swept while this tab was quiet
    await db.patch(id, { lastSeen: Date.now() });
    return true;
  },
});
