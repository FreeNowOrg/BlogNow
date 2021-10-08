import { VercelRequest, VercelResponse } from '@vercel/node'
import { v4 as UUID } from 'uuid'
import { HandleResponse } from 'serverless-kit'
import { DbPostDoc } from '../src/types/Database'
import { COLNAME } from './config'
import { database, getTokenFromReq } from './utils'
import {
  getAuthorityByToken,
  getCurUserData,
  getUserDataByToken,
} from './user/[controller]'

export const POSTDATA_DEFAULTS: DbPostDoc = {
  uuid: '',
  pid: 0,
  slug: '',
  title: '',
  content: '',
  created_at: '',
  author_uuid: '',
  edited_at: '',
  editor_uuid: '',
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  switch (req.method) {
    case 'GET':
      handleGet()
      break
    case 'POST':
      handlePost()
      break
    default:
      return http.send(405, 'Method Not Allowed')
  }

  async function handleGet() {
    if (req.query.uuid) {
      const post = await getPostByUuid(req.query.uuid as string)
      return http.send(200, 'Get post by uuid', { post })
    }

    const data = await getPostList({
      limit: parseInt((req.query.limit as string) || '10'),
      offset: parseInt((req.query.offset as string) || '0'),
    })
    http.send(200, 'Post list', data)
  }

  async function handlePost() {
    const token = getTokenFromReq(req)
    if (!token) {
      return http.send(401, 'Please login')
    }
    const user = await getUserDataByToken(token)
    if (!user || user.authority <= 2) {
      return http.send(403, 'Permission denied')
    }
    const { title, content, slug } = req.body || {}
    if (title === undefined || content === undefined) {
      return http.send(403, 'Missing params')
    }

    try {
      const data = await createPost({
        title,
        content,
        slug,
        author_uuid: user.uuid,
      })
      return http.send(200, 'Post created', data)
    } catch (e) {
      return http.mongoError(e)
    }
  }
}

export async function getPostList({
  sort = { pid: -1 },
  offset = 0,
  limit = 10,
}: {
  sort?: Record<string, 1 | -1>
  offset?: number
  limit?: number
}) {
  const { client, col } = database(COLNAME.POST)
  await client.connect()
  const posts = await col
    .find()
    .sort(sort)
    .skip(offset)
    .limit(Math.max(1, Math.min(25, limit)) + 1)
    .toArray()
  let hasNext = false
  if (posts.length > limit) {
    hasNext = true
    posts.pop()
  }
  return { posts, hasNext, limit, offset }
}

export async function getPostByUuid(uuid: string) {
  const { client, col } = database(COLNAME.POST)
  await client.connect()
  const r = await col.findOne({ uuid })
  return r
}

export async function createPost({
  title,
  content,
  slug = '',
  author_uuid,
}: {
  title: string
  content: string
  slug?: string
  author_uuid: string
}) {
  const { client, col } = database(COLNAME.POST)
  await client.connect()

  const now = new Date()

  const [lastPost] = await col
    .find()
    .project({ pid: 1 })
    .sort({ pid: -1 })
    .limit(1)
    .toArray()

  console.log({ lastPost })

  const pid = isNaN(lastPost?.pid)
    ? (await col.countDocuments()) + 1
    : (lastPost.pid as number) + 1
  const uuid = UUID()

  const insert: DbPostDoc = {
    ...POSTDATA_DEFAULTS,
    uuid,
    pid,
    title,
    content,
    slug,
    author_uuid,
    created_at: now.toISOString(),
  }
  const r = await col.insertOne(insert)
  await client.close()

  return { ...r, uuid }
}
