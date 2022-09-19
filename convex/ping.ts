import { GenericId } from "convex/values";
import { mutation } from "./_generated/server.js";

export default mutation(async ({ db }, id: string) => {
  await db.patch(new GenericId("players", id), { lastSeen: Date.now() });
});
