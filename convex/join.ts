import { mutation } from "./_generated/server.js";

export default mutation(async ({ db }) => {
  const now = Date.now();
  const recent = now - 10e3;

  const stale = await db
    .table("players")
    .filter((q) => q.lt(q.field("t"), recent))
    .collect();
  for (const { _id } of stale) await db.delete(_id);

  const players = await db.table("players").collect();
  players.sort((a, b) => a.n - b.n);
  for (let n = 0; n < 10; n++)
    if (!players[n] || n < players[n].n) {
      const player = { n, t: now };
      const _id = db.insert("players", player);
      return { _id, ...player };
    }
});
