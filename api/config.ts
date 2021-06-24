import { VercelRequest, VercelResponse } from '@vercel/node'
import { createFilter, createProjection, dbFind } from './database'

export async function getConfig(conf: string[]) {
  const [data] = await dbFind('config', {}, createProjection(conf))
  return data
}

export default async (req: VercelRequest, res: VercelResponse) => {}
