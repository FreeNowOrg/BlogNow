import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { dbFind, dbInsertOne, dbUpdateOne } from './database'
import { DatabaseUser } from './types'

async function login(request: any): Promise<number> {
  const { username, password } = request
  if (!(username && password)) {
    return -1
  }
  const dbData = await dbFind('users', { $or: [{ username: username }, { uid: parseInt(username) }] })
  if (dbData.length < 1) {
    return -1
  }
  dbData.forEach((value: DatabaseUser) => {
    if (authPassword(value.uid, password, value.passwordHash)) return value.uid
  })
  return -1
}

function authPassword(uid: number, password: string, desiredHash: string): boolean {
  const hash = crypto.createHmac('sha256', uid.toString()).update(password).digest('hex')
  return hash === desiredHash
}

async function logout(token: string): Promise<boolean> {
  const body = JSON.parse(Buffer.from(token.split('.')[1]).toString('ascii'))
  await dbUpdateOne('users', { uid: body.aud }, { $set: { lastTokenJti: '', lastActiveTime: Date.now() } })
  return true
}

async function register(request: any): Promise<number> {
  const { username, password } = request
  const dbData = await dbFind('users', {}, {}, 'uid', 1)
  const uid = +dbData[dbData.length - 1].uid + 1
  const hash = crypto.createHmac('sha256', uid.toString()).update(password).digest('hex')
  await dbInsertOne('users', { uid: uid, username: username, passwordHash: hash, registrationTime: Date.now() })
  return uid
}

async function modify(request: any, token: string): Promise<boolean> {
  const secondAuth = (tokenUid: number, requestUid: number, password: string, passwordHash: string) => {
    if (tokenUid !== requestUid) {
      return false
    }
    if (!authPassword(tokenUid, password, passwordHash)) {
      return false
    }
    return true
  }
  const dbData = await dbFind('users', { uid: request.uid })[0]
  const tokenUid = JSON.parse(Buffer.from(token.split('.')[1]).toString('ascii')).aud
  switch (request.modify) {
    case 'username':
      if (!secondAuth(tokenUid, request.uid, request.password, dbData.passwordHash)) {
        return false
      }
      if (request.newUsername === dbData.username) {
        return false
      }
      await dbUpdateOne('users', { uid: tokenUid }, { username: request.newUsername })
      return true
    case 'password':
      if (!secondAuth(tokenUid, request.uid, request.password, dbData.passwordHash)) {
        return false
      }
      const newHash = crypto.createHmac('sha256', tokenUid.toString()).update(request.newPassword).digest('hex')
      if (newHash === dbData.passwordHash) {
        return false
      }
      await dbUpdateOne('users', { uid: tokenUid }, { passwordHash: newHash })
      return true
    default:
      return false
  }
}

async function issueToken(uid: number): Promise<string> {
  const random = crypto.randomBytes(16).toString('hex')
  const secret = (await dbFind('config', { name: 'secret' }))[0].value
  await dbUpdateOne('users', { uid: uid }, { $set: { lastTokenJti: random, lastActiveTime: Date.now() } })
  return jwt.sign({}, secret, { audience: uid.toString(), expiresIn: '3d', jwtid: random })
}

async function verifyToken(token: string): Promise<boolean> {
  const secret = (await dbFind('config', { name: 'secret' }))[0].value
  try {
    const decoded: any = jwt.verify(token, secret)
    const dbData = await dbFind('users', { uid: decoded.aud })
    if (dbData.length < 1) {
      return false
    }
    if (decoded.jti !== dbData[0].lastTokenJti) {
      return false
    }
    return true
  } catch (error) {
    return false
  }
}

async function renewToken(token: string): Promise<string> {
  const body = JSON.parse(Buffer.from(token.split('.')[1]).toString('ascii'))
  return issueToken(body.aud)
}

function getTokenFromHeader(header: string): string {
  if (!header.startsWith('Bearer')) {
    return ''
  }
  return header.replace(/^Bearer /g, '')
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const postRequiredActions = ['login', 'logout', 'register', 'verify', 'modify']
  const { query, headers, body } = req
  if (postRequiredActions.includes(query.action.toString()) && req.method !== 'POST') {
    res
      .status(405)
      .setHeader('allow', 'POST')
      .json({ code: 405, message: 'This action only accepts POST method.' })
  }
  let uid = 0
  let token = ''
  switch (query.action) {
    case 'login':
      uid = await login({ username: body.username, password: body.password })
      if (uid !== -1) {
        res
          .status(200)
          .json({ code: 200, message: 'Login successful.', token: await issueToken(uid) })
      }
      break
    case 'register':
      uid = await register({ username: body.username, password: body.password })
      if (uid !== -1) {
        res
          .status(200)
          .json({ code: 200, message: 'Registration successful.', token: await issueToken(uid) })
      }
      break
    case 'logout':
      token = getTokenFromHeader(headers.authorization || '')
      if (await verifyToken(token)) {
        await logout(token)
        res
          .status(200)
          .json({ code: 200, message: 'Logout successful.' })
      }
      break
    case 'verify':
      token = getTokenFromHeader(headers.authorization || '')
      if (!await verifyToken(token)) {
        res
          .status(403)
          .json({ code: 403, message: 'Bad token received.' })
      } else {
        res
          .status(200)
          .json({ code: 200, message: 'Verification successful.', token: await renewToken(token) })
      }
      break
    case 'modify':
      token = getTokenFromHeader(headers.authorization || '')
      if (!await verifyToken(token)) {
        res
          .status(403)
          .json({ code: 403, message: 'Bad token received.' })
      } else {
        if (await modify(body, token)) {
          await logout(token)
          res
            .status(200)
            .json({ code: 200, message: 'Modification successful. You need to login again.' })
        } else {
          res
            .status(403)
            .json({ code: 403, message: 'Permission denied.' })
        }
      }
      break
    default:
      res
        .status(400)
        .json({ code: 400, message: 'Unknown action.' })
      break
  }
}
