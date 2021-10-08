import { VercelRequest, VercelResponse } from '@vercel/node'
import { HandleResponse } from 'serverless-kit'
import {
  DbAuthorityDoc,
  DbAuthorityKeys,
  DbUserDoc,
} from '../../src/types/Database'
import { COLNAME } from '../config'
import {
  database,
  getTokenFromReq,
  handleInvalidController,
  handleMissingParams,
} from '../utils'
import * as crypto from 'crypto'
import { v4 as UUID } from 'uuid'
import { nanoid } from 'nanoid'

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
  uuid: '',
  uid: 10000,
  username: '',
  email: '',
  created_at: '',
  nickname: '',
  slogan: '',
  gender: 'other',
  avatar: '',
  password_hash: '',
  token: '',
  token_expires: 0,
  authority: 1,
  title: '',
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const controller = (req.query.controller as string) || ''
  switch (req.method) {
    case 'GET':
      handleGet()
      break
    case 'POST':
      handlePost()
      break
    case 'PUT':
      handleUpdate()
      break
    default:
      return http.send(400, `Invalid method: ${req.method}`)
  }

  function handleGet() {
    switch (controller) {
      case 'meta':
        handleUserMeta()
        break
      case 'profile':
        handleSelfMeta()
        break
      default:
        handleInvalidController(http)
    }
  }

  function handlePost() {
    switch (controller) {
      case 'register':
        handleUserRegister()
        break
      case 'sign-in':
        handleUserLogin()
        break
      default:
        handleInvalidController(http)
    }
  }

  function handleUpdate() {
    const s = controller.split('.')
    if (s.length !== 2) {
      return handleInvalidController(http)
    }
    const target = s[0]
    const key = s[1]

    switch (target) {
      case 'self':
        updateSelf(key)
        break
      case 'other':
        updateUser(key)
        break
      default:
        handleInvalidController(http)
    }
  }

  async function handleUserRegister() {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return handleMissingParams(http)
    }
    if (username.length < 4 || password.length < 4) {
      return http.send(400, 'Username or password too short')
    }
    const { client, col } = database(COLNAME.USER)
    await client.connect()
    const already = await col.findOne({ username })
    if (already) {
      return http.send(403, 'Username is already in use')
    }

    const insert: DbUserDoc = {
      ...USERDATA_DEFAULTS,
      username,
      uuid: UUID(),
      password_hash: getPasswordHash(password),
    }
    const r = await col.insertOne(insert)
    return http.send(200, 'User created', r)
  }

  async function handleUserMeta() {
    return http.send(404, 'Work in progress')
  }

  async function handleSelfMeta() {
    const token = getTokenFromReq(req)
    if (!token) {
      return http.send(401, 'Please login')
    }
    const data = await getUserDataByToken(token)
    http.send(200, 'ok', data)
  }

  function updateSelf(key: string) {
    return http.send(404, 'Work in progress')
  }
  function updateUser(key: string) {
    return http.send(404, 'Work in progress')
  }

  async function handleUserLogin() {
    const { client, col } = database(COLNAME.USER)
    const { username, password } = req.body || {}
    if (!username || !password) {
      return http.send(400, 'Missing params')
    }
    await client.connect()
    const password_hash = getPasswordHash(password)
    const hasUser = await col.findOne({ username, password_hash })
    if (!hasUser) {
      return http.send(401, 'Invalid username or password')
    }
    const token =
      hasUser.token_expires - Date.now() < 0 ? nanoid(32) : hasUser.token
    const token_expires = Date.now() + 7 * 24 * 60 * 60 * 1000
    await col.updateOne(
      { uuid: hasUser.uuid },
      { $set: { token, token_expires } }
    )
    await client.close()
    http.res.setHeader(
      'set-cookie',
      `${TOKEN_COOKIE_NAME}=${token}; expires=${new Date(
        token_expires
      ).toUTCString()}; path=/`
    )
    return http.send(200, 'ok', { token })
  }
}

function getPasswordHash(p: string) {
  return crypto
    .createHash('sha256')
    .update(`salt=blognowtest,password=${p}`)
    .digest('hex')
}

export async function getUserDataByToken(
  token: string
): Promise<DbUserDoc | null> {
  const { client, col } = database(COLNAME.USER)
  await client.connect()
  const user = await col.findOne({
    token,
    token_expires: { $gt: Date.now() },
  })
  await client.close()
  if (!user) {
    return null
  }
  delete user.token
  delete user.token_expires
  delete user.password_hash
  return user as DbUserDoc
}

export async function getAuthorityByToken(token: string) {
  if (!token) return 0
  const user = await getUserDataByToken(token)
  return user?.authority || 0
}

export async function getCurAuthority(req: VercelRequest) {
  return getAuthorityByToken(getTokenFromReq(req))
}

export async function getCurUserData(req: VercelRequest) {
  return getUserDataByToken(getTokenFromReq(req))
}
