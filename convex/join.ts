import { mutation } from "./_generated/server.js";

export default mutation(async ({ db }, table: string) => {
  const now = Date.now();
  const recent = now - 10e3;

  // Remove stale.
  const stale = await db
    .table("players")
    .filter((q) => q.lt(q.field("lastSeen"), recent))
    .collect();
  for (const { _id } of stale) await db.delete(_id);

  // Find an available seat.
  const players = await db
    .table("players")
    .index("bySeat")
    .range((q) => q.eq("table", table))
    .collect();
  for (let n = 0; n <= 10; n++)
    if (!players[n] || n < players[n].seat) {
      const player = { table, seat: n, lastSeen: now };
      const id = db.insert("players", player);
      return { id: id.toString(), table, seat: n };
    }
});
