import { VercelRequest, VercelResponse } from '@vercel/node'
import { createFilter, createProjection, dbFind, dbUpdateOne } from './database'

export interface DatabaseSiteConfig {
  version: string
  secret: string
  siteName: string
}

export async function getBatchConfigs(key: string[]) {
  const data = await dbFind('config', { key: { $in: key } })
  console.log('getConfig', data)
  return data
}

export async function getConfigValue(key: string) {
  const [data] = await getBatchConfigs([key])
  return data?.value
}

export async function setConfig(key: string, value: any) {
  await dbUpdateOne('config', { key }, { $set: { value } })
}

export default async (req: VercelRequest, res: VercelResponse) => {}
