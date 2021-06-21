import { VercelRequest, VercelResponse } from '@vercel/node'
import { dbFind } from './database'
import { DatabasePost } from './types'

export default async (req: VercelRequest, res: VercelResponse) => {
  const pid = req.query.pid as string
  if (!pid) {
    return res.status(404).send({
      message: 'Post not found',
    })
  }

  const data = await getPost(pid)
  if (!data) {
    return res.status(404).send({
      message: 'Post not found',
    })
  }
  return res.send(data)
}

async function getPost(pid: string): Promise<DatabasePost | null> {
  const [post] = (await dbFind('posts', { pid })) as DatabasePost[]
  return post || null
}
