import { Id } from "./_generated/dataModel.js";
import { mutation } from "./_generated/server.js";

export default mutation(async ({ db }, id: Id<"players">) => {
  await db.patch(id, { t: Date.now() });
});
