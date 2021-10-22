import { DbAuthorityKeys, DbUserDoc } from '../src/types/Database'
import { COLNAME } from './config'
import { attachUsers, router, unique } from './utils'
import * as crypto from 'crypto'
import { v4 as UUID } from 'uuid'
import { nanoid } from 'nanoid'
import {
  passwordStrength,
  defaultOptions as passwordStrengthOptions,
} from 'check-password-strength'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPostModel } from './post'

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
  allow_comment: true,
  authority: 0,
  avatar: '',
  created_at: new Date(0),
  gender: 'other',
  nickname: '',
  slogan: '',
  title: '',
  uid: -1,
  username: '',
  uuid: '',
  // sensitive
  email: '',
  password_hash: '',
  salt: '',
  token: '',
  token_expires: 0,
}

export const PASSWORD_STRENGTH: 0 | 1 | 2 | 3 = 1

export function getUserModel(
  payload: Partial<DbUserDoc>,
  removeSensitive?: boolean
) {
  const data: DbUserDoc & { avatar: string; not_exist?: boolean } = {
    ...USERDATA_DEFAULTS,
    ...payload,
  }

  data.created_at = new Date(data.created_at)

  // Handle avatar
  const email_hash = crypto
    .createHash('md5')
    .update(data.email || '')
    .digest('hex')
  data.avatar = `https://gravatar.loli.net/avatar/${email_hash}`

  if (data.uid < 0) data.not_exist = true

  if (removeSensitive) {
    delete data.email
    delete data.password_hash
    delete data.token
    delete data.token_expires
    delete data.salt
  }
  return data
}

// Utils
function getPasswordHash(salt: string, password: string) {
  return crypto
    .createHash('sha256')
    .update(`salt=${salt},password=${password}`)
    .digest('hex')
}

function trimUsername(str: string) {
  return str
    .replace(/^[\s_\-\.~]+/, '')
    .replace(/[\s_\-\.~]+$/, '')
    .replace(/\s+/g, ' ')
}

export default (req: VercelRequest, res: VercelResponse) => {
  router.endpoint('/api/user')
  router.setCollection(COLNAME.USER)

  // Get single user
  router
    .addRoute()
    .method('GET')
    .path(['uuid', 'uid', 'username'], 'selector')
    .path(/.+/, 'target')
    .action(async (ctx) => {
      const filter = {
        [ctx.params.selector]:
          ctx.params.selector === 'uid'
            ? parseInt(ctx.params.target)
            : ctx.params.target,
      }

      const user = await ctx.col.findOne(filter)

      if (!user) {
        ctx.status = 404
        ctx.message = 'User not found'
        ctx.body = {
          filter,
          user: null,
        }
        return
      }

      ctx.status = 200
      ctx.message = 'Get user by filter'
      ctx.body = {
        user: getUserModel(user, true),
        filter,
      }
    })

  // Get users list
  router
    .addRoute()
    .method('GET')
    .endpoint('/api/users')
    .path(['uuid', 'uid', 'username'], 'selector')
    .path(/.+/, 'rawList')
    .action(async (ctx) => {
      const list = unique(ctx.params.rawList.split(/[|,]/).map((i) => i.trim()))
      if (list.length > 25) {
        ctx.customBody = {
          info: 'Too many requests, only the first 25 users are returned',
          has_next: true,
          next_uuids: list.slice(25 - list.length),
        }
      }
      const find = {
        $or: list.slice(0, 25).map((i) => ({
          [ctx.params.selector]:
            ctx.params.selector === 'uid' ? parseInt(i) : i,
        })),
      }
      const users = await ctx.col.find(find).toArray()
      ctx.message = 'Get users'
      ctx.body = {
        users: users.map((i) => getUserModel(i, true)),
        uuids: list.slice(0, 25),
      }
    })

  // Verify current user
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
    .check<{
      username: string
      password: string
    }>((ctx) => {
      let { username, password } = ctx.req.body || {}

      // Trim username
      username = trimUsername(username)

      const usernameTest = /^[_\-\.~\s0-9A-Za-z\u0080-\uFFFF]+$/
      if (!usernameTest.test(username) || username.length <= 5) {
        ctx.status = 400
        ctx.message = 'Invalid username.'
        ctx.body = {
          invalid_item: 'username',
          item_standard: username,
          item_test: false,
          item_required: {
            allowed_symbols: ['_', '-', '.', '~', ' '],
            regexp: usernameTest.toString(),
            min_length: 5,
          },
        }
        return false
      }

      const passwordTest = passwordStrength(password)
      if (passwordTest.id < PASSWORD_STRENGTH) {
        ctx.status = 400
        ctx.message = 'Password is too weak.'
        ctx.body = {
          invalid_item: 'password',
          item_test: passwordTest,
          item_required: passwordStrengthOptions[PASSWORD_STRENGTH],
        }
        return false
      }

      ctx.username = username
      ctx.password = password
    })
    .check(async (ctx) => {
      const { username } = ctx
      const already = await ctx.col.findOne({
        username: new RegExp(username, 'i'),
      })
      if (already) {
        ctx.status = 409
        ctx.message = 'Username has been taken'
        return false
      }
    })
    .action(async (ctx) => {
      const { username, password } = ctx

      const [lastUser] = (await ctx.col
        .find()
        .sort({ uid: -1 })
        .project({ uid: 1 })
        .limit(1)
        .toArray()) as DbUserDoc[]
      const uid = isNaN(lastUser?.uid)
        ? (await ctx.col.countDocuments()) + 10000
        : lastUser.uid + 1

      const salt = nanoid(32)
      const insert: DbUserDoc = getUserModel({
        authority: 1,
        username,
        uid,
        uuid: UUID(),
        password_hash: getPasswordHash(salt, password),
        salt,
        created_at: new Date(),
      })

      const dbRes = await ctx.col.insertOne(insert)

      ctx.message = 'User created'
      ctx.body = {
        ...dbRes,
        username,
      }
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
      const profile = await ctx.col.findOne({
        username,
      })
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

  // Get user posts
  router
    .addRoute()
    .method('GET')
    .path(['uuid', 'uid', 'username'], 'selector')
    .path(/.+/, 'target')
    .path(/posts?/)
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
    .check<{ author_uuid: string }>(async (ctx) => {
      const user = (await ctx.db.collection(COLNAME.USER).findOne({
        [ctx.params.selector]:
          ctx.params.selector === 'uid'
            ? parseInt(ctx.params.target)
            : ctx.params.target,
      })) as DbUserDoc
      if (!user) {
        ctx.status = 404
        ctx.message = 'Reqested user not found'
        ctx.body = {
          posts: [],
        }
        return false
      }
      ctx.author_uuid = user.uuid
    })
    .action(async (ctx) => {
      const posts = await ctx.db
        .collection(COLNAME.POST)
        .find({ author_uuid: ctx.author_uuid })
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
        posts: await attachUsers(ctx, posts.map(getPostModel)),
        has_next,
        limit: ctx.limit,
        offset: ctx.offset,
      }
    })

  return router.init(req, res)
}
