import { DbAuthorityKeys, DbUserDoc } from '../src/types/Database'
import { COLNAME } from './config'
import { checkLogin, router, sortKeys, initCol } from './utils'
import * as crypto from 'crypto'
import { v4 as UUID } from 'uuid'
import { nanoid } from 'nanoid'
import { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * @desc authority ```
 * 0: Everyone
 * 1: Member
 * 2: Editor
 * 3: Moderator
 * 4: System Operator
 * ```
 */
export const AUTHORITY_DEFAULTS: Record<DbAuthorityKeys, number> = {
  post_create: 2,
  post_delete_any: 3,
  post_edit_any: 4,
  comment_create: 0,
  comment_delete_any: 3,
  comment_edit_any: 4,
  comment_protect: 3,
  user_admin: 4,
  user_block: 3,
  user_group_edit: 4,
  user_register: 0,
  user_unblock_self: 4,
  site_admin: 4,
}

export const TOKEN_COOKIE_NAME = 'BLOG_NOW_TOKEN'
export const USERDATA_DEFAULTS: DbUserDoc = {
  authority: 0,
  avatar: '',
  created_at: '',
  email: '',
  gender: 'other',
  nickname: '',
  slogan: '',
  title: '',
  uid: -1,
  username: '',
  uuid: '',
  // sensitive
  password_hash: '',
  salt: '',
  token: '',
  token_expires: 0,
}

export function getUserModel(
  payload: Partial<DbUserDoc>,
  removeSensitive?: boolean
): DbUserDoc | Partial<DbUserDoc> {
  const data = {
    ...USERDATA_DEFAULTS,
    ...payload,
  }
  if (removeSensitive) {
    delete data.password_hash
    delete data.token
    delete data.token_expires
    delete data.salt
    return data as Partial<DbUserDoc>
  }
  return data as DbUserDoc
}

// Utils
function getPasswordHash(salt: string, password: string) {
  return crypto
    .createHash('sha256')
    .update(`salt=${salt},password=${password}`)
    .digest('hex')
}

export default (req: VercelRequest, res: VercelResponse) => {
  router.endpoint('/api/user')
  router.setCollection(COLNAME.USER)

  router
    .addRoute()
    .method('GET')
    .path(['uuid', 'uid'], 'selector')
    .path(/.+/, 'val')
    .action(async (ctx) => {
      const filter: Record<string, any> = {}
      filter[ctx.params.selector] =
        ctx.params.selector === 'uid'
          ? parseInt(ctx.params.val)
          : ctx.params.val

      const user = await ctx.col.findOne(filter)

      if (!user) {
        ctx.status = 404
        ctx.message = 'User not found'
        ctx.body = {
          filter,
        }
        return
      }

      ctx.status = 200
      ctx.message = 'Get user by filter'
      ctx.body = {
        filter,
        profile: getUserModel(user, true),
      }
    })

  router
    .addRoute()
    .method('GET')
    .path('auth')
    .path('profile')
    .check((ctx) => {
      if (!ctx.user.uuid || ctx.user.uid < 0) {
        ctx.status = 401
        ctx.message = 'Please login'
        ctx.body = {
          profile: getUserModel(ctx.user, true),
        }
        return false
      }
    })
    .action(async (ctx) => {
      ctx.body = {
        profile: getUserModel(ctx.user, true),
      }
    })

  router
    .addRoute()
    .method('POST')
    .path('auth')
    .path('register')
    .check((ctx) => {
      const { username, password } = ctx.req.body || {}
      if (!username || !password) {
        ctx.status = 400
        ctx.message = 'Missing params'
        return false
      }
    })
    .check((ctx) => {
      const { username, password } = ctx.req.body || {}
      if (username.length < 4 || password.length < 4) {
        ctx.status = 400
        ctx.message = 'Username or password too short'
        return false
      }
    })
    .check(async (ctx) => {
      const { username } = ctx.req.body || {}
      const already = await ctx.col.findOne({ username })
      if (already) {
        ctx.status = 409
        ctx.message = 'Username has been taken'
        return false
      }
    })
    .action(async (ctx) => {
      const { username, password } = ctx.req.body || {}

      const [lastUser] = await ctx.col
        .find()
        .sort({ uid: -1 })
        .project({ uid: 1 })
        .limit(1)
        .toArray()
      const uid = isNaN(lastUser?.pid)
        ? (await ctx.col.countDocuments()) + 10000
        : (lastUser.pid as number) + 1

      const salt = nanoid(32)
      const insert: DbUserDoc = getUserModel({
        authority: 1,
        username,
        uid,
        uuid: UUID(),
        password_hash: getPasswordHash(salt, password),
        salt,
        created_at: new Date().toISOString(),
      })

      const dbRes = await ctx.col.insertOne(insert)

      ctx.message = 'User created'
      ctx.body = dbRes
    })

  router
    .addRoute()
    .method('POST')
    .path('auth')
    .path(/(log-?in|sign-?in)/)
    .check((ctx) => {
      const { username, password } = ctx.req.body || {}
      if (!username || !password) {
        ctx.status = 400
        ctx.message = 'Missing params'
        return false
      }
    })
    .action(async (ctx) => {
      const { username, password } = ctx.req.body || {}
      const profile = await ctx.col.findOne({ username })
      if (!profile) {
        ctx.status = 403
        ctx.message = 'Invalid username'
        return false
      }
      const password_hash = getPasswordHash(profile.salt, password)
      if (password_hash !== profile.password_hash) {
        ctx.status = 403
        ctx.message = 'Invalid password'
        return false
      }
      const token =
        profile.token_expires - Date.now() < 0 ? nanoid(32) : profile.token
      const token_expires = Date.now() + 7 * 24 * 60 * 60 * 1000
      await ctx.col.updateOne(
        { uuid: profile.uuid },
        { $set: { token, token_expires } }
      )

      ctx.res.setHeader(
        'set-cookie',
        `${TOKEN_COOKIE_NAME}=${token}; expires=${new Date(
          token_expires
        ).toUTCString()}; path=/`
      )

      ctx.body = { token, profile: getUserModel(profile, true) }
    })

  return router.init(req, res)
}
