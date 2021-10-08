import { VercelRequest, VercelResponse } from '@vercel/node'
import { Document } from 'bson'
import { readFileSync } from 'fs'
import { HandleResponse } from 'serverless-kit'
import { database } from './utils'

export const COLNAME = {
  COMMENT: 'comments',
  CONFIG: 'config',
  USER: 'users',
  POST: 'posts',
}

const CONFIG_DEFAULTS = [
  { key: 'siteName', val: 'Blog Now' },
  { key: 'siteDesc', val: 'My new blog!' },
]

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  return http.send(404, 'Work in progress')
}

export async function initSiteConfig(force?: boolean) {
  const { client, col } = database(COLNAME.CONFIG)
  await client.connect()
  if (!!(await col.countDocuments()) && !force) {
    throw 'Collection is not empty'
  }
  await col.drop()
  const r = await col.insertMany(CONFIG_DEFAULTS)
  await client.close()
  return r
}

export async function getConfig(key: string): Promise<string | null> {
  return getLocalConfig(key) || (await getCloudConfig(key))
}

export function getLocalConfig(key: string) {
  let fileJSON: Record<string, string> = {}
  try {
    const file = readFileSync('blognow.config.json')
    fileJSON = JSON.parse(file.toString())
  } catch (e) {
    console.warn('Can not find local config file')
  }
  return process.env[key.toUpperCase()] || fileJSON[key] || null
}

export async function getCloudConfig(key: string) {
  const { client, col } = database(COLNAME.CONFIG)
  await client.connect()
  const doc = col.findOne({ key })
  await client.close()
  return (doc as Document)?.val || null
}
