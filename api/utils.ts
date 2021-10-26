import { VercelRequest, VercelResponse } from '@vercel/node'
import { Collection, Db, MongoClient } from 'mongodb'
import {
  HandleRouter,
  HandleResponse,
  Route,
  getProjectSrotFromStr,
} from 'serverless-kit'
import { SITE_ENV } from '../src/config'
import { ApiAttachedUser } from '../src/types'
import { DbPostDoc, DbUserDoc } from '../src/types/Database'
import { COLNAME, getLocalConfig } from './config'
import { getUserModel, TOKEN_COOKIE_NAME } from './user'

// type gymnastics
declare module '../node_modules/serverless-kit/lib/modules/HandleRouter' {
  interface HandleRouter {
    setCollection: (col: string) => HandleRouter<{ col: Collection }>
  }
  interface Route<ContextT extends unknown = RouteContextDefaults> {
    checkAuth: (required: number) => Route<RouteContextDefaults & ContextT>
    checkLogin: () => Route<RouteContextDefaults & ContextT>
    parseOffsetLimitSort: () => Route<
      RouteContextDefaults &
        ContextT & {
          offset: number
          limit: number
          sort: Record<string, -1 | 1>
        }
    >
  }
}

HandleRouter.prototype.setCollection = function (colName) {
  return this.beforeEach((ctx) => {
    ctx.col = ctx.db.collection(colName)
  })
}

Route.prototype.checkAuth = function (required) {
  return this.check((ctx) => {
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
  })
}

Route.prototype.checkLogin = function () {
  return this.check((ctx) => {
    if (!ctx.user.uuid || ctx.user.uid < 0) {
      ctx.status = 401
      ctx.message = 'Please login'
      return false
    }
  })
}

Route.prototype.parseOffsetLimitSort = function () {
  return this.check((ctx) => {
    ctx.offset = parseInt((ctx.req.query.offset as string) || '0')
    ctx.limit = Math.min(25, parseInt((ctx.req.query.limit as string) || '10'))
    ctx.sort = getProjectSrotFromStr((ctx.req.query.sort as string) || '')
  })
}

// Constuct a router
const router = new HandleRouter<{
  mongoClient: MongoClient
  db: Db
  col: Collection
  user: DbUserDoc
}>()
// Make sure the body exists
router.beforeEach((ctx) => {
  ctx.body = ctx.body || {}
  ctx.req.body = ctx.req.body || {}
})
// Connect db
router.beforeEach(initMongo)
// Pre fetch userData
router.beforeEach(initUserData)
// Close db
router.afterEach(closeMongo)
export { router }
export default (req: VercelRequest, res: VercelResponse) => {
  return router.init(req, res)
}

export async function initMongo(ctx: any) {
  const client = new MongoClient(
    getLocalConfig('MONGO_URI') || 'mongodb://localhost'
  )
  const db = client.db(getLocalConfig('BLOGNOW_DB') || 'blog_now')
  try {
    await client.connect()
  } catch (e) {
    ctx.status = 501
    ctx.message =
      'Unable to connect to the database or the MONGO_URI is incorrectly configured.'
    return false
  }
  console.log('DB connected')
  ctx.mongoClient = client
  ctx.db = db
}

export function initCol(ctx: any, colName: string) {
  ctx.col = ctx.db.collection(colName)
}

export async function closeMongo(ctx: any) {
  await ctx.mongoClient.close()
  console.log('DB closed')
}

export async function initUserData(ctx: any) {
  const token = getTokenFromReq(ctx.req)
  const col = (ctx.db as Db).collection(COLNAME.USER)
  const user = await col.findOne({
    token,
    token_expires: { $gt: Date.now() },
  })
  ctx.user = getUserModel(user)
}

export async function checkLogin(ctx: any) {
  if (!ctx.user.uuid || ctx.user.uid < 0) {
    ctx.status = 401
    ctx.message = 'Please login'
    return false
  }
}

export function checkAuth(required: number, ctx: any) {
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

export async function attachUsers<T>(
  ctx: { db: Db },
  docs: T[]
): Promise<(T & ApiAttachedUser)[]> {
  if (docs.length < 1) return []
  const findList: string[] = []
  docs.forEach(({ author_uuid, editor_uuid }) => {
    findList.push(author_uuid, editor_uuid)
  })
  const users = (await ctx.db
    .collection(COLNAME.USER)
    .find({
      $or: unique(findList)
        .filter((i) => !!i)
        .map((uuid) => ({ uuid })),
    })
    .toArray()) as DbUserDoc[]
  return docs.map((i: any) => {
    i.author = getUserModel(
      users.find(({ uuid }) => uuid === i.author_uuid),
      true
    )
    i.editor = getUserModel(
      users.find(({ uuid }) => uuid === i.editor_uuid),
      true
    )
    return i
  })
}

export function sortKeys<T extends Object>(obj: T): T {
  const copy = {} as T
  const allKeys = Object.keys(obj).sort()
  allKeys.forEach((key) => {
    copy[key] = obj[key]
  })
  return copy
}

export function unique<T>(arr: T[]) {
  return Array.from(new Set(arr))
}
