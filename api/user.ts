import { VercelRequest, VercelResponse } from '@vercel/node'
import { HandleResponse } from 'serverless-kit'
import { DbAuthorityKeys, DbUserDoc } from '../src/types/Database'
import { COLNAME } from './config'
import {
  database,
  getTokenFromReq,
  handleInvalidController,
  handleInvalidScope,
  handleMissingParams,
  sortKeys,
} from './utils'
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
  nickname: '',
  email: '',
  title: '',
  slogan: '',
  gender: 'other',
  created_at: '',
  avatar: '',
  authority: 1,
  // sensitive
  password_hash: '',
  token: '',
  token_expires: 0,
  salt: '',
}

export function getUserModel(
  payload: Partial<DbUserDoc>,
  removeSensitive?: boolean
) {
  const data = {
    ...USERDATA_DEFAULTS,
    ...payload,
  }
  if (!removeSensitive) {
    delete data.password_hash
    delete data.token
    delete data.token_expires
    delete data.salt
  }
  return sortKeys(data)
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const { CONTROLLER, SCOPE } = req.query
  let scopeBeNumber = false

  switch (req.method) {
    case 'GET':
      return methodGET()
    case 'POST':
      return methodPOST()
    case 'PATCH':
      return methodPATCH()
    default:
      http.res.setHeader('allow', 'GET, POST, PATCH')
      return http.send(400, `Invalid method: ${req.method}`)
  }

  // GET
  function methodGET() {
    switch (CONTROLLER) {
      case 'uid':
        scopeBeNumber = true
      case 'uuid':
        return get_meta()
      case 'auth':
        return get_auth()
      default:
        return handleInvalidController(http)
    }
  }

  async function get_meta() {
    if (!SCOPE) {
      return handleInvalidScope(http)
    }
    const filter: Record<string, any> = {}
    filter[CONTROLLER as string] = scopeBeNumber
      ? parseInt(SCOPE as string)
      : SCOPE

    try {
      const { client, col } = database(COLNAME.USER)
      await client.connect()
      const user = await col.findOne(filter)
      await client.close()

      if (!user) {
        return http.send(404, 'User not found', { filter })
      }

      return http.send(200, `Get user by filter`, {
        filter,
        user: getUserModel(user, true),
      })
    } catch (e) {
      return http.mongoError(e)
    }
  }

  async function get_auth() {
    switch (SCOPE) {
      case 'profile':
        return get_auth_profile()
      default:
        return handleInvalidScope(http)
    }
  }

  async function get_auth_profile() {
    const token = getTokenFromReq(req)
    if (!token) {
      return http.send(401, 'Please login')
    }
    const profile = await getUserMetaByToken(token)
    return http.send(200, 'ok', { profile })
  }

  // POST
  function methodPOST() {
    switch (CONTROLLER) {
      case 'auth':
        post_auth()
        break
      default:
        handleInvalidController(http)
    }
  }

  function post_auth() {
    switch (SCOPE) {
      case 'register':
        post_auth_register()
        break
      case 'sign-in':
      case 'login':
        post_auth_login()
        break
      default:
        handleInvalidController(http)
    }
  }

  async function post_auth_register() {
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

    const salt = nanoid(32)
    const insert: DbUserDoc = getUserModel({
      username,
      uuid: UUID(),
      password_hash: getPasswordHash(salt, password),
      salt,
      created_at: new Date().toISOString(),
    })

    const r = await col.insertOne(insert)
    return http.send(200, 'User created', r)
  }

  async function post_auth_login() {
    const { client, col } = database(COLNAME.USER)
    const { username, password } = req.body || {}
    if (!username || !password) {
      return http.send(400, 'Missing params')
    }
    await client.connect()
    const profile = await col.findOne({ username })
    if (!profile) {
      return http.send(401, 'Invalid username')
    }
    const password_hash = getPasswordHash(profile.salt, password)
    if (password_hash !== profile.password_hash) {
      return http.send(401, 'Invalid password')
    }
    const token =
      profile.token_expires - Date.now() < 0 ? nanoid(32) : profile.token
    const token_expires = Date.now() + 7 * 24 * 60 * 60 * 1000
    await col.updateOne(
      { uuid: profile.uuid },
      { $set: { token, token_expires } }
    )
    await client.close()
    http.res.setHeader(
      'set-cookie',
      `${TOKEN_COOKIE_NAME}=${token}; expires=${new Date(
        token_expires
      ).toUTCString()}; path=/`
    )
    delete profile.token
    delete profile.token_expires
    delete profile.password_hash
    delete profile.salt
    return http.send(200, 'ok', { token, profile })
  }

  // PATCH
  function methodPATCH() {
    return http.send(404, 'Work in progress')
  }
}

// Utils
function getPasswordHash(salt: string, password: string) {
  return crypto
    .createHash('sha256')
    .update(`salt=${salt},password=${password}`)
    .digest('hex')
}

export async function getUserMetaByToken(
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
  return getUserModel(user, true)
}

export async function getAuthorityByToken(token: string) {
  if (!token) return 0
  const user = await getUserMetaByToken(token)
  return user?.authority || 0
}

export async function getCurAuthority(req: VercelRequest) {
  return getAuthorityByToken(getTokenFromReq(req))
}

export async function getCurUserData(req: VercelRequest) {
  return getUserMetaByToken(getTokenFromReq(req))
}
