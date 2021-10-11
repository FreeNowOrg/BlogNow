import { VercelRequest, VercelResponse } from '@vercel/node'
import { v4 as UUID } from 'uuid'
import { HandleResponse } from 'serverless-kit'
import { DbPostDoc } from '../src/types/Database'
import { COLNAME } from './config'
import {
  database,
  getTokenFromReq,
  handleInvalidController,
  handleInvalidScope,
  sortKeys,
} from './utils'
import { getUserMetaByToken } from './user'

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

export function getPostModel(payload: Partial<DbPostDoc>) {
  return sortKeys({
    ...POSTDATA_DEFAULTS,
    ...payload,
  })
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const { CONTROLLER, SCOPE } = req.query

  switch (req.method) {
    case 'GET':
      return methodGET()
    case 'POST':
      return methodPOST()
    case 'PATCH':
      return methodPATCH()
    // case 'DELETE':
    //   return methodDELETE()
    default:
      http.res.setHeader('allow', 'GET, POST, PATCH, DELETE')
      return http.send(405, 'Method Not Allowed')
  }

  async function methodGET() {
    const filter: Record<string, any> = {}
    const hasScope = () => {
      if (SCOPE) {
        return true
      } else {
        handleInvalidScope(http)
        return false
      }
    }

    switch (CONTROLLER) {
      case 'list':
        return get_list()
      case 'uuid':
        hasScope() && (filter.uuid = SCOPE)
        break
      case 'pid':
        hasScope() && (filter.pid = SCOPE)
        break
      default:
        return handleInvalidController(http)
    }

    return get_byFilter(filter)
  }

  async function get_byFilter(filter: Record<string, any>) {
    const { client, col } = database(COLNAME.POST)
    await client.connect()
    const post = await col.findOne(filter)
    if (!post) {
      return http.send(404, 'Post not found', { filter })
    }
    return http.send(200, `Get post by filter`, { post, filter })
  }

  function get_list() {
    switch (SCOPE) {
      case 'recent':
      case 'recents':
        return get_list_recent()
      default:
        return handleInvalidScope(http)
    }
  }

  async function get_list_recent() {
    const data = await getPostList({
      limit: parseInt((req.query.limit as string) || '10'),
      offset: parseInt((req.query.offset as string) || '0'),
    })
    http.send(200, `Get post list by ${SCOPE}`, data)
  }

  // POST
  async function methodPOST() {
    switch (CONTROLLER) {
      case 'new':
      case 'create':
        return post_create()
      default:
        return handleInvalidController(http)
    }
  }

  async function post_create() {
    // auth
    const token = getTokenFromReq(req)
    if (!token) {
      return http.send(401, 'Please login')
    }
    const user = await getUserMetaByToken(token)
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

  async function methodPATCH() {
    if (!SCOPE) {
      return handleInvalidScope(http)
    }

    const filter: Record<string, any> = {}
    switch (CONTROLLER) {
      case 'uuid':
        filter.uuid = SCOPE
        break
      case 'pid':
        filter.pid = SCOPE
        break
      default:
        return handleInvalidScope(http)
    }

    return patch_byFilter(filter)
  }

  async function patch_byFilter(filter: Record<string, any>) {
    const token = getTokenFromReq(req)
    const { title, content, slug } = req.body || {}
    if (!token) {
      return http.send(401, 'Please login')
    }
    const user = await getUserMetaByToken(token)
    if (!user || user.authority <= 2) {
      return http.send(403, 'Permission denied')
    }
    if (title === undefined || content === undefined) {
      return http.send(403, 'Missing params')
    }

    const { client, col } = database(COLNAME.POST)
    const now = new Date()

    try {
      await client.connect()
      const data = await col.updateOne(filter, {
        $set: {
          title,
          content,
          edited_at: now.toISOString(),
          editor_uuid: user.uuid,
        },
      })
      await client.close()

      if (data.modifiedCount < 1) {
        return http.send(404, 'Post not foud', data)
      }
      return http.send(200, 'Post updated', data)
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
  return { posts: posts.map(getPostModel), hasNext, limit, offset }
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

  const insert: DbPostDoc = getPostModel({
    uuid,
    pid,
    title,
    content,
    slug,
    author_uuid,
    created_at: now.toISOString(),
  })
  const r = await col.insertOne(insert)
  await client.close()

  return { ...r, uuid }
}
