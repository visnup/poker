import { query } from './_generated/server'

export default query(async ({ db }) => {
  return db.table('deals').order('desc').first()
})
