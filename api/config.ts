import { readFileSync } from 'fs'
import { HandeleRouter } from 'serverless-kit'
import { closeMongo, initMongo, initUserData } from './utils'

const router = new HandeleRouter()

export default router.init

export const COLNAME = {
  COMMENT: 'comments',
  CONFIG: 'config',
  USER: 'users',
  POST: 'posts',
}

const CONFIG_DEFAULTS = [
  { key: 'siteName', val: 'Blog Now' },
  { key: 'siteDesc', val: 'My new blog!' },
]

// Connect db
router.beforeEach(async (ctx) => await initMongo(ctx, COLNAME.CONFIG))

// Close db
router.afterEach(closeMongo)

// Pre fetch userData
router.beforeEach(initUserData)

// GET /site/meta
router
  .addRoute()
  .method('GET')
  .path('site')
  .path('meta')
  .action(async (ctx) => {
    const total_posts = await ctx.db.collection(COLNAME.POST).countDocuments()
    const total_users = await ctx.db.collection(COLNAME.USER).countDocuments()
    ctx.body.meta = { total_posts, total_users }
    ctx.message = 'Get site meta'
  })

// export async function initSiteConfig(force?: boolean) {
//   const { client, col } = database(COLNAME.CONFIG)
//   await client.connect()
//   if (!!(await col.countDocuments()) && !force) {
//     throw 'Collection is not empty'
//   }
//   await col.drop()
//   const r = await col.insertMany(CONFIG_DEFAULTS)
//   await client.close()
//   return r
// }

// export async function getConfig(key: string): Promise<string | null> {
//   return getLocalConfig(key) || (await getCloudConfig(key))
// }

export function getLocalConfig(key: string) {
  let fileJSON: Record<string, string> = {}
  try {
    const file = readFileSync('blognow.config.json')
    fileJSON = JSON.parse(file.toString())
  } catch (e) {
    console.warn('Can not find local config file')
  }
  return process.env[key.toUpperCase()] || fileJSON[key] || null
}

// export async function getCloudConfig(key: string) {
//   const { client, col } = database(COLNAME.CONFIG)
//   await client.connect()
//   const doc = col.findOne({ key })
//   await client.close()
//   return (doc as Document)?.val || null
// }
