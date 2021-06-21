import { VercelRequest, VercelResponse } from '@vercel/node'
import { dbFind } from './database'

async function getAuth(req: VercelRequest):Promise<> {
  const { lgtoken } = req.cookies
  if (!lgtoken) return false
  const data = await dbFind('users', { token: { $in: [lgtoken] } })
  if (data.length < 1) return false
}

export default (req: VercelRequest, res: VercelResponse) => {}
