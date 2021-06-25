import { VercelRequest, VercelResponse } from '@vercel/node'
import { dbConnect, dbFind } from './database'

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

  const data = await getPost('pid', pid)
  if (!data) {
    return res.status(404).send({
      message: 'Post not found',
    })
  }
  return res.send(data)
}

export async function getPost(
  key: keyof DatabasePost,
  value: string
): Promise<DatabasePost | null> {
  const [post] = (await dbFind('posts', {
    [key]: value,
  })) as DatabasePost[]
  return post || null
}

export async function getPostsByUser(uuid: string) {
  const list = await dbFind('posts', { author: uuid })
  return list
}

export async function getPostNumberOfUser(uuid: string): Promise<number> {
  const db = await dbConnect()
  const num = await db.collection('posts').countDocuments({ author: uuid })
  return num
}

export async function updatePost({ pid, content }) {}

export async function getPosts(
  key: keyof DatabasePost,
  pattern,
  flags?: string
) {
  const list = await dbFind('posts', { [key]: new RegExp(pattern, flags) })
  return list
}
