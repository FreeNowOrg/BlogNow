import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { dbFind, dbInsertOne, dbUpdateOne } from './database'
import { getConfigValue } from './config'

// Types
export interface DatabaseUser {
  _id: string
  uuid: string
  username: string // unique
  nickname: string
  passwordHash: string
  userGroups: UserGroup[]
  // postNumber: number
  registrationTime: string
  lastActiveTime: string
  lastTokenJti: string
}

export interface UserUpdateParams {
  uuid: string
  username?: string
  password?: string
  newName?: string
  newPassword?: string
  modify?: 'username' | 'nickname' | 'password'
}

export type UserGroup = '*' | 'member' | 'moderator' | 'admin'

export async function login(request: UserUpdateParams): Promise<string> {
  const { username, password } = request
  const dbData = await dbFind('users', {
    $or: [{ username: username }, { nickname: username }],
  })
  if (dbData.length < 1) {
    throw new Error('No such user')
  }
  for (const value of dbData) {
    if (authPassword(value.uuid, password, value.passwordHash))
      return value.uuid
  }
  throw new Error('Invalid username or password')
}

export async function register(request: UserUpdateParams): Promise<string> {
  const { username, password } = request
  if (!username || !password) {
    throw new Error('Empty username or password')
  }
  const dbData = await dbFind('users', { username })
  if (dbData.length > 0) {
    throw new Error('A user with this name already exists')
  }
  const uuid = uuidv4()
  const hash = crypto.createHmac('sha256', uuid).update(password).digest('hex')
  await dbInsertOne('users', {
    uuid,
    username,
    nickname: username,
    passwordHash: hash,
    registrationTime: new Date().toISOString(),
  })
  return uuid
}

export async function logout(
  request: UserUpdateParams,
  token: string
): Promise<void> {
  await verifyToken(request, token)
  await dbUpdateOne(
    'users',
    { uuid: request.uuid },
    { $set: { lastTokenJti: '', lastActiveTime: new Date().toISOString() } }
  )
}

export async function modify(
  request: UserUpdateParams,
  token: string
): Promise<void> {
  await verifyToken(request, token)
  const dbData = await dbFind('users', { uuid: request.uuid })[0]
  switch (request.modify) {
    case 'nickname':
      await modifyNickname(dbData.nickname, request)
      break
    case 'username':
      if (!secondAuth(request, dbData)) {
        throw new Error('Permission denied')
      }
      await modifyUsername(dbData.username, request)
      break
    case 'password':
      if (!secondAuth(request, dbData)) {
        throw new Error('Permission denied')
      }
      await modifyPassword(dbData.passwordHash, request)
      break
    default:
      throw new Error('No such modify action')
  }
}

export function authPassword(
  uuid: string,
  password: string,
  desiredHash: string
): boolean {
  const hash = crypto.createHmac('sha256', uuid).update(password).digest('hex')
  return hash === desiredHash
}

export function secondAuth(request: UserUpdateParams, dbData: DatabaseUser) {
  if (dbData.uuid !== request.uuid) {
    return false
  }
  if (!authPassword(dbData.uuid, request.password, dbData.passwordHash)) {
    return false
  }
  return true
}

export async function modifyNickname(
  oldName: string,
  request: UserUpdateParams
) {
  if (request.newName === oldName) {
    throw new Error('New nickname is the same as the old one')
  }
  await dbUpdateOne(
    'users',
    { uuid: request.uuid },
    { nickname: request.newName }
  )
}

export async function modifyUsername(
  oldName: string,
  request: UserUpdateParams
) {
  if (request.newName === oldName) {
    throw new Error('New username is the same as the old one')
  }
  await dbUpdateOne(
    'users',
    { uuid: request.uuid },
    { username: request.newName }
  )
}

export async function modifyPassword(
  oldHash: string,
  request: UserUpdateParams
) {
  const newHash = crypto
    .createHmac('sha256', request.uuid)
    .update(request.newPassword)
    .digest('hex')
  if (newHash === oldHash) {
    throw new Error('New password is the same as the old one')
  }
  await dbUpdateOne('users', { uuid: request.uuid }, { passwordHash: newHash })
}

export async function issueToken(uuid: string): Promise<string> {
  const random = crypto.randomBytes(16).toString('hex')
  const secret = await getConfigValue('secret')
  const iat = Date.now()
  await dbUpdateOne(
    'users',
    { uuid },
    {
      $set: {
        lastTokenJti: random,
        lastActiveTime: new Date(iat).toISOString(),
      },
    }
  )
  return jwt.sign({ iat: Math.floor(iat / 1000) }, secret, {
    audience: uuid,
    expiresIn: '3d',
    jwtid: random,
  })
}

export async function verifyToken(
  request: UserUpdateParams,
  token: string
): Promise<void> {
  const secret: string = await getConfigValue('secret')
  const dbData = await dbFind('users', { uuid: request.uuid })
  if (dbData.length < 1) {
    throw new Error('No such user')
  }
  jwt.verify(token, secret, {
    audience: request.uuid,
    jwtid: dbData[0].lastTokenJti,
  })
}

// this helper function helps to renew token in one step
export async function renewToken(
  request: UserUpdateParams,
  token: string
): Promise<string> {
  await verifyToken(request, token)
  const newToken = await issueToken(request.uuid)
  return newToken
}

export function getTokenFromHeader(header: string): string {
  if (!header.startsWith('Bearer ')) {
    return ''
  }
  return header.replace(/^Bearer /g, '')
}

// API notice: please send 'Authorization' header to check token validity
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const postRequiredActions = [
      'login',
      'logout',
      'register',
      'verify',
      'modify',
    ]
    const { query, headers, body } = req
    if (
      postRequiredActions.includes(query.action?.toString()) &&
      req.method !== 'POST'
    ) {
      throw new Error('This action only accepts POST method')
    }
    let uuid = ''
    const token = getTokenFromHeader(headers.authorization)
    switch (query.action) {
      case 'login':
        uuid = await login({
          uuid: '',
          username: body.username,
          password: body.password,
        })
        res.status(200).json({
          message: 'Login successful.',
          uuid,
          token: await issueToken(uuid),
        })
        break
      case 'register':
        uuid = await register({
          uuid: '',
          username: body.username,
          password: body.password,
        })
        res.status(200).json({
          message: 'Registration successful.',
          uuid,
          token: await issueToken(uuid),
        })
        break
      case 'logout':
        await logout(body, token)
        res.status(200).json({ message: 'Logout successful.', uuid: body.uuid })
        break
      case 'verify':
        await verifyToken(body, token)
        res.status(200).json({
          message: 'Verification successful.',
          uuid: body.uuid,
          token: await issueToken(body.uuid),
        })
        break
      case 'modify':
        await modify(body, token)
        const response = {
          message: 'Modification successful.',
          uuid: body.uuid,
        }
        // modify username and password requires login again,
        // also no new token is issued
        if (['username', 'password'].includes(body.modify)) {
          await logout(body, token)
          response.message = 'Modification successful. Please login again.'
        } else {
          Object.assign(response, { token: await issueToken(body.uuid) })
        }
        res.status(200).json(response)
        break
      default:
        throw new Error('Unknown action')
    }
  } catch (error) {
    // all error handled here
    switch (error.message) {
      case 'No such user':
      case 'Invalid username or password':
      case 'Empty username or password':
      case 'A user with this name already exists':
      case 'No such modify action':
      case 'New nickname is the same as the old one':
      case 'New username is the same as the old one':
      case 'New password is the same as the old one':
        res.status(400)
        break
      case 'Permission denied':
        res.status(403)
        break
      case 'This action only accepts POST method':
        res.setHeader('allow', 'POST').status(405)
        break
      default:
        res.status(500)
        break
    }
    res.json({
      message: error.message,
    })
    throw error
  }
}
