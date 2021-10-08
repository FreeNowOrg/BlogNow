import { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient } from 'mongodb'
import { GenerateMongo, HandleResponse } from 'serverless-kit'
import { getLocalConfig } from './config'
import { TOKEN_COOKIE_NAME } from './user/[controller]'

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  http.send(403, 'Invalid endpoint')
}

export function database(colName: string, devMode?: boolean) {
  const client = new MongoClient(
    getLocalConfig('MONGO_URI') || 'mongodb://localhost'
  )
  const db = client.db(getLocalConfig('BLOGNOW_DB') || 'blog_now')
  const col = db.collection(colName)
  return { client, db, col }
}

export function handleInvalidController(http: HandleResponse) {
  http.send(400, `Invalid controller: ${http.req.query.controller}`, {})
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
