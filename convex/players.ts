import { range } from "d3-array";
import { v } from "convex/values";
import { mutation } from "./_generated/server.js";

const window = 30e3;

export const join = mutation({
  args: { table: v.string(), id: v.optional(v.id("players")) },
  handler: async ({ db }, { table, id }) => {
    const now = Date.now();
    const previous = id ? await db.get(id) : null;
    const returning = previous?.table === table ? previous : null;
    const active = await db
      .query("players")
      .withIndex("byLastSeen", (q) =>
        q.eq("table", table).gt("lastSeen", now - window),
      )
      .collect();
    const seats = new Set(
      active.filter((p) => p._id !== returning?._id).map((p) => p.seat),
    );
    const seat =
      returning && !seats.has(returning.seat)
        ? returning.seat
        : range(11).find((n) => !seats.has(n));
    if (seat === undefined) return null;

    if (returning) {
      await db.patch(returning._id, { seat, lastSeen: now });
      return { id: returning._id, table, seat };
    } else {
      const id = await db.insert("players", { table, seat, lastSeen: now });
      return { id, table, seat };
    }
  },
});

export const ping = mutation({
  args: { id: v.id("players") },
  handler: ({ db }, { id }) => db.patch(id, { lastSeen: Date.now() }),
});
