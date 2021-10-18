import { v4 as UUID } from 'uuid'
import { DbPostDoc } from '../src/types/Database'
import { COLNAME } from './config'
import { attachUsersToPosts, router, sortKeys } from './utils'
import slugify from 'slugify'
import { VercelRequest, VercelResponse } from '@vercel/node'

export const POSTDATA_DEFAULTS: DbPostDoc = {
  uuid: '',
  pid: 0,
  slug: '',
  title: '',
  content: '',
  created_at: '',
  author_uuid: '',
  edited_at: '',
  editor_uuid: '',
}

export function getPostModel(payload: Partial<DbPostDoc>) {
  const post = sortKeys({
    ...POSTDATA_DEFAULTS,
    ...payload,
  })
  post.slug = slugify(post.slug, { lower: true })
  return post
}

export default (req: VercelRequest, res: VercelResponse) => {
  router.endpoint('/api/post')
  router.setCollection(COLNAME.POST)

  // GET /post/:selector/:scope
  router
    .addRoute()
    .method('GET')
    .path(['uuid', 'pid', 'slug'], 'selector')
    .path(/.+/, 'target')
    .action(async (ctx) => {
      const filter = {
        [ctx.params.selector]:
          ctx.params.selector === 'pid'
            ? parseInt(ctx.params.target)
            : ctx.params.target,
      }

      const post = await ctx.col.findOne(filter)

      if (!post) {
        ctx.status = 404
        ctx.message = 'Post not found'
        ctx.body = {
          filter,
          post: null,
        }
        return
      } else {
        ctx.message = 'Get post by filter'
      }

      const [post1] = await attachUsersToPosts(ctx, [post])

      ctx.body = { post: post1, filter }
    })

  // GET /post/list/recent
  router
    .addRoute()
    .method('GET')
    .path('list')
    .path(/recents?/)
    .check<{
      offset: number
      limit: number
    }>((ctx) => {
      ctx.offset = parseInt((ctx.req.query.offset as string) || '0')
      ctx.limit = Math.min(
        25,
        parseInt((ctx.req.query.limit as string) || '10')
      )
    })
    .action(async (ctx) => {
      const posts = await ctx.col
        .find()
        .sort({ pid: -1 })
        .skip(ctx.offset)
        .limit(ctx.limit)
        .toArray()

      let has_next = false
      if (posts.length > ctx.limit) {
        has_next = true
        posts.pop()
      }

      ctx.body = {
        posts: await attachUsersToPosts(ctx, posts.map(getPostModel)),
        has_next,
        limit: ctx.limit,
        offset: ctx.offset,
      }
    })

  // POST /post/create
  router
    .addRoute()
    .method('POST')
    .path(['create', 'new'])
    .checkLogin()
    .checkAuth(2)
    .check((ctx) => {
      ctx.req.body = ctx.req.body || {}
      const { title, content } = ctx.req.body
      if (title === undefined || content === undefined) {
        ctx.status = 400
        ctx.message = 'Missing params'
        return false
      }
    })
    .check(async (ctx) => {
      ctx.req.body.slug = slugify(ctx.req.body.slug || '', { lower: true })
      const slug = ctx.req.body.slug
      if (slug && (await ctx.col.findOne({ slug }))) {
        ctx.status = 409
        ctx.message = 'Slug has been taken'
        return false
      }
    })
    .action(async (ctx) => {
      const { title, content, slug } = ctx.req.body
      const now = new Date()

      const [lastPost] = await ctx.col
        .find()
        .project({ pid: 1 })
        .sort({ pid: -1 })
        .limit(1)
        .toArray()

      const pid = isNaN(lastPost?.pid)
        ? (await ctx.col.countDocuments()) + 1
        : (lastPost.pid as number) + 1
      const uuid = UUID()

      const insert: DbPostDoc = getPostModel({
        uuid,
        pid,
        title,
        content,
        slug,
        author_uuid: ctx.user.uuid,
        created_at: now.toISOString(),
      })
      const dbRes = await ctx.col.insertOne(insert)

      ctx.message = 'Post created'
      ctx.body = { ...dbRes, uuid }
    })

  // PATCH /post/:selector/:scope
  router
    .addRoute()
    .method('PATCH')
    .path(['uuid', 'pid', 'slug'], 'selector')
    .path(/.+/, 'target')
    .checkLogin()
    // Validate body
    .check((ctx) => {
      ctx.req.body = ctx.req.body || {}
      const { title, content } = ctx.req.body
      if (title === undefined || content === undefined) {
        ctx.status = 400
        ctx.message = 'Missing params'
        return false
      }
    })
    // Find target post
    .check<{
      post: DbPostDoc
    }>(async (ctx) => {
      const filter = {
        [ctx.params.selector]:
          ctx.params.selector === 'pid'
            ? parseInt(ctx.params.target)
            : ctx.params.target,
      }
      ctx.post = (await ctx.col.findOne(filter)) as DbPostDoc

      if (!ctx.post) {
        ctx.status = 404
        ctx.message = 'Post not found'
        return false
      }
    })
    // User authentication
    .check((ctx) => {
      if (ctx.post.author_uuid !== ctx.user.uuid && ctx.user.authority <= 4) {
        ctx.status = 403
        ctx.message = 'Permission denied'
        return false
      }
    })
    // Check slug conflict
    .check(async (ctx) => {
      ctx.req.body.slug = slugify(ctx.req.body.slug || '', { lower: true })
      const slug = ctx.req.body.slug

      if (slug && slug !== ctx.post.slug && (await ctx.col.findOne({ slug }))) {
        ctx.status = 409
        ctx.message = 'Slug has been taken'
        return false
      }
    })
    // Update db
    .action(async (ctx) => {
      const { title, content, slug } = ctx.req.body
      const now = new Date()

      const dbRes = await ctx.col.updateOne(
        { uuid: ctx.post.uuid },
        {
          $set: {
            title,
            content,
            slug,
            edited_at: now.toISOString(),
            editor_uuid: ctx.user.uuid,
          },
        }
      )

      ctx.message = 'Post updated'
      ctx.body = {
        ...dbRes,
        uuid: ctx.post.uuid,
        pid: ctx.post.pid,
        slug: slug ?? ctx.post.slug,
      }
    })

  return router.init(req, res)
}
