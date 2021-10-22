import { VercelRequest, VercelResponse } from '@vercel/node'
import { DbCommentDoc, DbUserDoc } from '../src/types'
import { COLNAME } from './config'
import { v4 as UUID } from 'uuid'
import { router } from './utils'
import { Db } from 'mongodb'
import { RouteContextDefaults } from 'serverless-kit'

const COMMENT_DEFAULTS: DbCommentDoc = {
  target_type: 'post',
  target_uuid: '',
  uuid: '',
  content: '',
  author_uuid: '',
  editor_uuid: '',
  created_at: new Date(0),
  edited_at: new Date(0),
  is_deleted: false,
}

export function getCommentModel(payload: Partial<DbCommentDoc>) {
  return {
    ...COMMENT_DEFAULTS,
    ...payload,
  }
}

export default (req: VercelRequest, res: VercelResponse) => {
  router.endpoint('/api/comment')
  router.setCollection(COLNAME.COMMENT)

  // Get comments for user or post
  router
    .addRoute()
    .method('GET')
    .path(['user', 'post'], 'target_type')
    .path(/.+/, 'target_uuid')
    .parseOffsetLimitSort()
    .check(checkCanCreate)
    .action(async (ctx) => {
      const filter = {
        target_type: ctx.params.target_type,
        target_uuid: ctx.params.target_uuid,
      }

      const total_comments = await ctx.col.find(filter).count()
      const comments = await ctx.col
        .find(filter)
        .skip(ctx.offset)
        .sort(ctx.sort)
        .limit(ctx.limit + 1)
        .toArray()

      let has_next = true
      if (comments.length > ctx.limit) {
        has_next = false
        comments.pop()
      }

      ctx.message = 'Get comments by filter'
      ctx.body = {
        comments,
        filter,
        total_comments,
        offset: ctx.offset,
        limit: ctx.limit,
        sort: ctx.sort,
        has_next,
      }
    })

  // Add comment
  router
    .addRoute()
    .method('POST')
    .path(['user', 'post'], 'target_type')
    .path(/.+/, 'target_uuid')
    .checkLogin()
    .checkAuth(1)
    .check<{
      content: string
    }>((ctx) => {
      const { content } = ctx.req.body
      if (!content.trim()) {
        ctx.status = 400
        ctx.message = 'Missing content'
        return false
      }
      ctx.content = '' + content
    })
    .check(checkCanCreate)
    .action(async (ctx) => {
      const comment = getCommentModel({
        author_uuid: ctx.user.uuid,
        content: ctx.content,
        created_at: new Date(),
        uuid: UUID(),
      })
      const dbRes = await ctx.col.insertOne(comment)

      ctx.message = 'Comment created.'
      ctx.body = {
        comment,
        ...dbRes,
      }
    })

  return router.init(req, res)
}

async function checkCanCreate(
  ctx: RouteContextDefaults & { db: Db; user: DbUserDoc }
) {
  const target = await ctx.db
    .collection(COLNAME[ctx.params.target_type.toUpperCase()])
    .findOne({ uuid: ctx.params.target_uuid })
  if (!target || target.is_deleted) {
    ctx.status = 404
    ctx.message = `Requested ${ctx.params.target_type} not found.`
    return false
  } else if (
    target.is_private &&
    !target.allowed_user.includes(ctx.user.uuid)
  ) {
    ctx.status = 403
    ctx.message = 'Permision denied'
    return false
  }
}
