import { mutation } from "./_generated/server.js";

export default mutation(async ({ db }) => {
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
    .range((q) => q)
    .collect();
  for (let n = 0; n <= 10; n++)
    if (!players[n] || n < players[n].seat) {
      const player = { seat: n, lastSeen: now };
      const id = db.insert("players", player);
      return { id: id.toString(), seat: n };
    }
});
