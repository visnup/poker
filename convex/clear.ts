import { mutation } from "./_generated/server.js";

export default mutation(async ({ db }, table: string) => {
  const dealt = await db
    .table("deals")
    .index("byTable")
    .range((q) => q.eq("table", table))
    .order("desc")
    .first();
  if (dealt) await db.patch(dealt._id, { cleared: true });
});
