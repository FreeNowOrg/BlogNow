import { COLNAME } from './config'
import { getPostModel } from './post'
import { router } from './utils'

export default (req, res) => {
  router.endpoint('/api')

  // GET /site/meta
  router
    .addRoute()
    .method('GET')
    .path('site')
    .path('meta')
    .action(async (ctx) => {
      // Total stats
      const total_posts = await ctx.db.collection(COLNAME.POST).countDocuments()
      const total_users = await ctx.db.collection(COLNAME.USER).countDocuments()
      const total_tags = await ctx.db.collection(COLNAME.TAG).countDocuments()

      // Get found date
      const [firstUser] = await ctx.db
        .collection(COLNAME.USER)
        .find()
        .project({ created_at: 1 })
        .sort({ uid: 1 })
        .limit(1)
        .toArray()
      let founded_at = ''
      if (firstUser) {
        founded_at = firstUser.created_at
      }

      // Get latest update
      const [latestPost] = await ctx.db
        .collection(COLNAME.POST)
        .find()
        .sort({ pid: -1 })
        .limit(1)
        .toArray()
      let latest_post = null
      if (latestPost) {
        latest_post = getPostModel(latestPost)
        delete latest_post.content
      }

      ctx.body = {
        meta: { total_posts, total_users, total_tags, founded_at, latest_post },
      }
      ctx.message = 'Get site meta'
    })

  return router.init(req, res)
}
