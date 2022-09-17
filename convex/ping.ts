import { mutation } from './_generated/server.js'

export default mutation(async ({ db }, id) => {
  await db.patch(id, { t: Date.now() })
})
