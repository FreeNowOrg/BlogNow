import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { dbFind, dbInsertOne, dbUpdateOne } from './database'
import { getConfigValue } from './config'

// Types
export interface DatabaseUser {
  _id: string
  uid: number // login alias
  uuid: string
  username: string
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
  newUsername?: string
  newPassword?: string
  modify?: 'username' | 'password'
}

export type UserGroup = '*' | 'member' | 'moderator' | 'admin'

export async function login(request: any): Promise<string> {
  const { username, password } = request
  if (!(username && password)) {
    return ''
  }
  const dbData = await dbFind('users', {
    $or: [{ username: username }, { uid: parseInt(username) }],
  })
  if (dbData.length < 1) {
    return ''
  }
  dbData.forEach((value: DatabaseUser) => {
    if (authPassword(value.uuid, password, value.passwordHash))
      return value.uuid
  })
  return ''
}

export function authPassword(
  uuid: string,
  password: string,
  desiredHash: string
): boolean {
  const hash = crypto.createHmac('sha256', uuid).update(password).digest('hex')
  return hash === desiredHash
}

export async function logout(token: string): Promise<boolean> {
  const body = JSON.parse(Buffer.from(token.split('.')[1]).toString('ascii'))
  await dbUpdateOne(
    'users',
    { uuid: body.aud },
    { $set: { lastTokenJti: '', lastActiveTime: new Date().toISOString() } }
  )
  return true
}

export async function createUser(request: UserUpdateParams): Promise<string> {
  const { username, password } = request

  if ((await dbFind('users', { username })).length > 0) return ''

  const dbData = await dbFind('users', {}, {}, 'uid', -1)
  const uid = dbData.length > 0 ? +dbData[0].uid + 1 : 10000
  const uuid = uuidv4()
  const hash = crypto.createHmac('sha256', uuid).update(password).digest('hex')
  await dbInsertOne('users', {
    uid,
    uuid,
    username,
    passwordHash: hash,
    registrationTime: new Date().toISOString(),
  })
  return uuid
}

export async function updateUser(
  request: UserUpdateParams,
  token: string
): Promise<boolean> {
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
  try {
    const secret = (await dbFind('config', { name: 'secret' }))[0].value
    const dbData = await dbFind('users', { uuid: request.uuid })[0]
    const decoded: any = jwt.verify(token, secret)
    const tokenUUID = decoded.aud
    switch (request.modify) {
      case 'username':
        if (
          !secondAuth(
            tokenUUID,
            request.uuid,
            request.password,
            dbData.passwordHash
          )
        ) {
          return false
        }
        if (request.newUsername === dbData.username) {
          return false
        }
        await dbUpdateOne(
          'users',
          { uuid: tokenUUID },
          { username: request.newUsername }
        )
        return true
      case 'password':
        if (
          !secondAuth(
            tokenUUID,
            request.uuid,
            request.password,
            dbData.passwordHash
          )
        ) {
          return false
        }
        const newHash = crypto
          .createHmac('sha256', tokenUUID)
          .update(request.newPassword)
          .digest('hex')
        if (newHash === dbData.passwordHash) {
          return false
        }
        await dbUpdateOne(
          'users',
          { uuid: tokenUUID },
          { passwordHash: newHash }
        )
        return true
      default:
        return false
    }
  } catch (error) {
    return false
  }
}

export async function issueToken(uuid: string): Promise<string> {
  const random = crypto.randomBytes(16).toString('hex')
  const secret = await getConfigValue('secret')
  await dbUpdateOne(
    'users',
    { uuid: uuid },
    { $set: { lastTokenJti: random, lastActiveTime: new Date().toISOString() } }
  )
  return jwt.sign({}, secret, {
    audience: uuid,
    expiresIn: '3d',
    jwtid: random,
  })
}

export async function verifyToken(
  uuid: string,
  token: string
): Promise<boolean> {
  try {
    const secret = (await dbFind('config', { name: 'secret' }))[0].value
    const dbData = await dbFind('users', { uuid })
    if (dbData.length < 1) {
      return false
    }
    jwt.verify(token, secret, { audience: uuid, jwtid: dbData[0].lastTokenJti })
    return true
  } catch (error) {
    return false
  }
}

export async function renewToken(token: string): Promise<string> {
  const body = JSON.parse(
    Buffer.from(token.split('.')[1], 'base64').toString('ascii')
  )
  return issueToken(body.aud)
}

export function getTokenFromHeader(header: string): string {
  if (!header.startsWith('Bearer ')) {
    return ''
  }
  return header.replace(/^Bearer /g, '')
}

export default async (req: VercelRequest, res: VercelResponse) => {
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
    res
      .status(405)
      .setHeader('allow', 'POST')
      .json({ code: 405, message: 'This action only accepts POST method.' })
  }
  let uuid = ''
  let token = ''
  switch (query.action) {
    case 'login':
      uuid = await login({ username: body.username, password: body.password })
      if (uuid !== '') {
        return res.status(200).json({
          code: 200,
          message: 'Login successful.',
          token: await issueToken(uuid),
        })
      }
      return res
        .status(403)
        .send({ code: 403, message: 'Wrong username or password' })
      break
    case 'register':
      console.log(body)
      uuid = await createUser({
        uuid: '',
        username: body.username,
        password: body.password,
      })
      if (uuid) {
        return res.status(200).json({
          code: 200,
          message: 'Registration successful.',
          token: await issueToken(uuid),
        })
      }
      return res.status(403).json({
        code: 403,
        message: 'Requested username was already in use'
      })
      break
    case 'logout':
      token = getTokenFromHeader(headers.authorization || '')
      if (await verifyToken(body.uuid, token)) {
        await logout(token)
        res.status(200).json({ code: 200, message: 'Logout successful.' })
      }
      break
    case 'verify':
      token = getTokenFromHeader(headers.authorization || '')
      if (!(await verifyToken(body.uuid, token))) {
        res.status(403).json({ code: 403, message: 'Bad token received.' })
      } else {
        res.status(200).json({
          code: 200,
          message: 'Verification successful.',
          token: await renewToken(token),
        })
      }
      break
    case 'modify':
      if (await updateUser(body, token)) {
        await logout(token)
        res.status(200).json({
          code: 200,
          message: 'Modification successful. You need to login again.',
        })
      }
      break
    default:
      res.status(400).json({ code: 400, message: 'Unknown action.' })
      break
  }
}
