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
    throw new Error('No user found')
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

export function authPassword(
  uuid: string,
  password: string,
  desiredHash: string
): boolean {
  const hash = crypto.createHmac('sha256', uuid).update(password).digest('hex')
  return hash === desiredHash
}

export async function logout(
  request: UserUpdateParams,
  token: string
): Promise<void> {
  await verifyToken(request, token)
  await dbUpdateOne(
    'users',
    { uuid: request.uuid },
    { $set: { lastTokenJti: '', lastActiveTime: Date.now() } }
  )
}

export async function modify(
  request: UserUpdateParams,
  token: string
): Promise<void> {
  await verifyToken(request, token)
  const secondAuth = (
    tokenUUID: string,
    requestUUID: string,
    password: string,
    passwordHash: string
  ) => {
    if (tokenUUID !== requestUUID) {
      return false
    }
    if (!authPassword(tokenUUID, password, passwordHash)) {
      return false
    }
    return true
  }
  const secret = (await dbFind('config', { name: 'secret' }))[0].value
  const dbData = await dbFind('users', { uuid: request.uuid })[0]
  const decoded: any = jwt.verify(token, secret)
  const tokenUUID = decoded.aud
  switch (request.modify) {
    case 'nickname':
      await modifyNickname(dbData.nickname, request)
      break
    case 'username':
      if (
        !secondAuth(
          tokenUUID,
          request.uuid,
          request.password,
          dbData.passwordHash
        )
      ) {
        throw new Error('Permission denied')
      }
      await modifyUsername(dbData.username, request)
      // sensitive action, need to login again
      await logout(request, token)
      break
    case 'password':
      if (
        !secondAuth(
          tokenUUID,
          request.uuid,
          request.password,
          dbData.passwordHash
        )
      ) {
        throw new Error('Permission denied')
      }
      await modifyPassword(dbData.passwordHash, request)
      // sensitive action, need to login again
      await logout(request, token)
      break
    default:
      throw new Error('No such modify action')
  }
}

// this function should not be exported
async function modifyNickname(oldName: string, request: UserUpdateParams) {
  if (request.newName === oldName) {
    throw new Error('New nickname is the same as the old one')
  }
  await dbUpdateOne(
    'users',
    { uuid: request.uuid },
    { nickname: request.newName }
  )
}

// this function should not be exported
async function modifyUsername(oldName: string, request: UserUpdateParams) {
  if (request.newName === oldName) {
    throw new Error('New username is the same as the old one')
  }
  await dbUpdateOne(
    'users',
    { uuid: request.uuid },
    { username: request.newName }
  )
}

// this function should not be exported
async function modifyPassword(oldHash: string, request: UserUpdateParams) {
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
    { $set: { lastTokenJti: random, lastActiveTime: iat } }
  )
  return jwt.sign({ iat }, secret, {
    audience: uuid,
    expiresIn: '3d',
    jwtid: random,
  })
}

export async function verifyToken(
  request: UserUpdateParams,
  token: string
): Promise<void> {
  const secret = (await dbFind('config', { name: 'secret' }))[0].value
  const dbData = await dbFind('users', { uuid: request.uuid })
  if (dbData.length < 1) {
    throw new Error('No such user')
  }
  jwt.verify(token, secret, {
    audience: request.uuid,
    jwtid: dbData[0].lastTokenJti,
  })
}

export function getTokenFromHeader(header: string): string {
  if (!header.startsWith('Bearer ')) {
    return ''
  }
  return header.replace(/^Bearer /g, '')
}

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
          code: 0,
          message: 'Registration successful.',
          uuid,
          token: await issueToken(uuid),
        })
        break
      case 'logout':
        await logout(body, token)
        res
          .status(200)
          .json({ code: 0, message: 'Logout successful.', uuid: body.uuid })
        break
      case 'verify':
        await verifyToken(body, token)
        res.status(200).json({
          code: 0,
          message: 'Verification successful.',
          uuid: body.uuid,
          token: await issueToken(body.uuid),
        })
        break
      case 'modify':
        await modify(body, token)
        res.status(200).json({
          code: 0,
          message: 'Modification successful.',
          uuid: body.uuid,
        })
        break
      default:
        throw new Error('Unknown action')
    }
  } catch (error) {
    res.status(500).json({
      code: 1,
      message: `Server error: ${error.message}`,
    })
    throw error
  }
}
