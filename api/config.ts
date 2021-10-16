import { readFileSync } from 'fs'
import { router } from './utils'
import { VercelRequest, VercelResponse } from '@vercel/node'

router.endpoint('/api/config')

export const COLNAME = {
  COMMENT: 'comments',
  CONFIG: 'config',
  LOG: 'logs',
  USER: 'users',
  POST: 'posts',
  TAG: 'tags',
}

const CONFIG_DEFAULTS = [
  { key: 'siteName', val: 'Blog Now' },
  { key: 'siteDesc', val: 'My new blog!' },
]

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

export default (req: VercelRequest, res: VercelResponse) => {
  router.endpoint('/api/config')
  router.setCollection(COLNAME.CONFIG)

  return router.init(req, res)
}
