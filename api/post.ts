import { VercelRequest, VercelResponse } from '@vercel/node'
import { dbFind } from './database'

// Types
export interface DatabasePost {
  _id: string
  pid: string
  slugs: string[]
  author: string
  title: string
  content: string
  time: {
    published: string
    modified: string
  }
  categories: string[]
  contentHistory: {
    latest?: boolean
    title: string
    content: string
    editor: string
    modified: string
  }[]
}

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
