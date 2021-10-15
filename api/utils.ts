import { VercelRequest, VercelResponse } from '@vercel/node'
import { Collection, Db, MongoClient } from 'mongodb'
import {
  HandleRouter,
  HandleResponse,
  Route,
  RouteContextDefaults,
} from 'serverless-kit'
import { DbUserDoc } from '../src/types/Database'
import { COLNAME, getLocalConfig } from './config'
import { getUserModel, TOKEN_COOKIE_NAME } from './user'

// HandleRouter.prototype.setCollection = function (colName) {
//   console.log('setCol')
//   this.beforeEach((ctx) => {
//     ctx.col = ctx.db.collection(colName)
//   })
//   return this
// }

// Route.prototype.checkAuth = function (required) {
//   this.check((ctx) => {
//     if (ctx.user.authority < required) {
//       ctx.status = 403
//       ctx.message = 'Permission denied'
//       ctx.body = {
//         authcheck: {
//           required,
//           recived: ctx.user.authority,
//         },
//       }
//       return false
//     }
//   })
//   return this
// }

// Route.prototype.checkLogin = function () {
//   this.check((ctx) => {
//     if (!ctx.user.uuid || ctx.user.uid < 0) {
//       ctx.status = 401
//       ctx.message = 'Please login'
//       return false
//     }
//   })
//   return this
// }

// Router
const router = new HandleRouter<{
  mongoClient: MongoClient
  db: Db
  col?: Collection
  user: DbUserDoc
}>()
// Connect db
router.beforeEach(initMongo)
// Close db
router.afterEach(closeMongo)
// Pre fetch userData
router.beforeEach(initUserData)
export { router }
export default (req, res) => {
  return router.init(req, res)
}

export async function initMongo(ctx) {
  const client = new MongoClient(
    getLocalConfig('MONGO_URI') || 'mongodb://localhost'
  )
  const db = client.db(getLocalConfig('BLOGNOW_DB') || 'blog_now')
  await client.connect()
  ctx.mongoClient = client
  ctx.db = db
  console.log('DB Connected')
}

export function initCol(ctx, colName: string) {
  ctx.col = ctx.db.collection(colName)
}

export async function closeMongo(ctx) {
  await ctx.mongoClient.close()
  console.log('DB Closed')
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
