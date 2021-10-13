import { v4 as UUID } from 'uuid'
import { HandeleRouter } from 'serverless-kit'
import { DbPostDoc } from '../src/types/Database'
import { COLNAME } from './config'
import {
  checkAuth,
  checkLogin,
  closeMongo,
  initMongo,
  initUserData,
  sortKeys,
} from './utils'
import slugify from 'slugify'

const router = new HandeleRouter()
export default router.init

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

// Connect db
router.beforeEach(async (ctx) => await initMongo(ctx, COLNAME.POST))

// Close db
router.afterEach(closeMongo)

// Pre fetch userData
router.beforeEach(initUserData)

// GET /post/:selector/:scope
router
  .addRoute()
  .method('GET')
  .path('post')
  .path(['uuid', 'pid', 'slug'], 'filterKey')
  .path(/.+/, 'filterVal')
  .action(async (ctx) => {
    const filter = {}
    filter[ctx.params.filterKey] =
      ctx.params.filterKey === 'pid'
        ? parseInt(ctx.params.filterVal)
        : ctx.params.filterVal

    const post = await ctx.col.findOne(filter)

    if (!post) {
      ctx.status = 404
      ctx.message = 'Post not found'
    } else {
      ctx.message = 'Get post by filter'
    }
    ctx.body = { post, filter }
  })

// GET /post/list/recent
router
  .addRoute()
  .method('GET')
  .path('post')
  .path('list')
  .path(/recents?/)
  .check((ctx) => {
    ctx.offset = parseInt((ctx.req.query.offset as string) || '0')
    ctx.limit = Math.min(25, parseInt((ctx.req.query.limit as string) || '10'))
  })
  .action(async (ctx) => {
    const posts = await ctx.col
      .find()
      .sort({ pid: -1 })
      .skip(ctx.offset)
      .limit(ctx.limit)
      .toArray()

    let hasNext = false
    if (posts.length > ctx.limit) {
      hasNext = true
      posts.pop()
    }

    ctx.body = {
      posts: posts.map(getPostModel),
      hasNext,
      limit: ctx.limit,
      offset: ctx.offset,
    }
  })

// POST /post/create
router
  .addRoute()
  .method('POST')
  .path('post')
  .path(['create', 'new'])
  .check(checkLogin)
  .check((ctx) => checkAuth(2, ctx))
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
  .path('post')
  .path(['uuid'], 'filterKey')
  .path(/.+/, 'filterVal')
  .check(checkLogin)
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
  .check(async (ctx) => {
    const filter = {}
    filter[ctx.params.filterKey] = ctx.params.filterVal
    ctx.post = await ctx.col.findOne(filter)

    if (!ctx.post) {
      ctx.status = 404
      ctx.message = 'Post not found'
      return false
    }
  })
  // User authentication
  .check((ctx) => {
    if (ctx.post.author_uuid !== ctx.user.uuid && ctx.user.authority <= 3) {
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
    ctx.body = dbRes
  })
