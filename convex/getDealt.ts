import { query } from "./_generated/server";

export default query(async ({ db }, table: string) => {
  return db
    .table("deals")
    .index("byTable")
    .range((q) => q.eq("table", table))
    .order("desc")
    .first();
});
