import { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient } from 'mongodb'
import { HandleResponse } from 'serverless-kit'
import { COLNAME, getLocalConfig } from './config'
import { getUserModel, TOKEN_COOKIE_NAME } from './user'

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  http.send(403, 'Invalid endpoint')
}

export async function initMongo(ctx, colName?: string) {
  const client = new MongoClient(
    getLocalConfig('MONGO_URI') || 'mongodb://localhost'
  )
  const db = client.db(getLocalConfig('BLOGNOW_DB') || 'blog_now')
  await client.connect()
  ctx.mongoClient = client
  ctx.db = db
  if (colName) ctx.col = db.collection(colName)
}

export async function closeMongo(ctx) {
  await ctx.mongoClient.close()
}

export async function initUserData(ctx) {
  const token = getTokenFromReq(ctx.req)
  const col = ctx.db.collection(COLNAME.USER)
  const user = await col.findOne({
    token,
    token_expires: { $gt: Date.now() },
  })
  ctx.user = getUserModel(user)
}

export async function checkLogin(ctx) {
  if (!ctx.user.uuid || ctx.user.uid < 0) {
    ctx.status = 401
    ctx.message = 'Please login'
    return false
  }
}

export function checkAuth(required: number, ctx) {
  if (ctx.user.authority < required) {
    ctx.status = 403
    ctx.message = 'Permission denied'
    ctx.body = {
      authcheck: {
        required,
        recived: ctx.user.authority,
      },
    }
    return false
  }
}

export function handleInvalidController(http: HandleResponse) {
  return http.send(400, `Invalid controller: ${http.req.query.CONTROLLER}`, {})
}

export function handleInvalidScope(http: HandleResponse) {
  return http.send(400, `Invalid scope: ${http.req.query.SCOPE}`, {})
}

export function handleMissingParams(http: HandleResponse) {
  http.send(400, 'Missing params')
}

export function getTokenFromReq(req: VercelRequest) {
  return (
    (req.query.token as string) ||
    req.headers.authorization ||
    req.cookies[TOKEN_COOKIE_NAME] ||
    ''
  )
}

export function sortKeys<T extends Object>(obj: T): T {
  const copy = {} as T
  const allKeys = Object.keys(obj).sort()
  allKeys.forEach((key) => {
    copy[key] = obj[key]
  })
  return copy
}
