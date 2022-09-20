import { mutation } from "./_generated/server.js";

export default mutation(async ({ db }) => {
  const dealt = await db.table("deals").order("desc").first();
  if (dealt) await db.patch(dealt._id, { cleared: true });
});
