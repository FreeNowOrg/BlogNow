import axios from 'axios'
import { ref } from 'vue'
import { API_BASE } from '../config'
import { DbPostDoc } from '../types/Database'

export const siteCache = ref({
  meta: {} as Record<string, any>,
  posts: [] as DbPostDoc[],
  recents: [] as string[],
})

export function setPostCache(post: DbPostDoc) {
  const index = siteCache.value.posts.findIndex(
    ({ uuid }) => uuid === post.uuid
  )
  if (index < 0) {
    console.info('[CACHE]', 'Update post cache')
    siteCache.value.posts.push(post)
  } else {
    console.info('[CACHE]', 'Set post cache')
    siteCache.value.posts[index] = post
  }
  return true
}

export async function getPost(
  params: Partial<DbPostDoc>,
  noCache?: boolean
): Promise<DbPostDoc | null> {
  const key = Object.keys(params)[0] as keyof DbPostDoc
  const val: any = params[key]
  const cache = siteCache.value.posts.find((i) => i[key] === val)
  if (cache && !noCache) {
    console.info('[CACHE]', 'Get post from cache')
    return cache
  }
  params[key] = val
  try {
    console.info('[CACHE]', 'Get post from origin')
    const { data }: any = await axios.get(`${API_BASE}/post`, { params })
    setPostCache(data.body.post)
    return data.body.post
  } catch (e) {
    return null
  }
}

export async function addNewPost(payload: Partial<DbPostDoc>) {
  const { data }: any = await axios.post(`${API_BASE}/post`, { data: payload })
  return data
}

export async function updatePost(payload: Partial<DbPostDoc>) {
  const { data }: any = await axios.patch(`${API_BASE}/post`, { data: payload })
  return data
}

export async function getPostList({ limit = 25, offset = 0 }) {
  const { data }: any = await axios.get(`${API_BASE}/post`, {
    params: { limit, offset },
  })

  const posts: DbPostDoc[] = data.body.posts || []

  if (offset === 0 && posts.length > 0) {
    console.info('[CACHE]', 'Set recents')
    siteCache.value.recents = posts.map(({ uuid }) => uuid)
  }

  posts.forEach(setPostCache)

  return posts
}

export async function getRecentPosts(noCache?: boolean) {
  const list: DbPostDoc[] = []
  if (siteCache.value.recents.length > 0 && !noCache) {
    console.info('[CACHE]', 'Get recents from cache')
    siteCache.value.recents.forEach((uuid) => {
      const post = siteCache.value.posts.find(
        ({ uuid: uuid1 }) => uuid === uuid1
      )
      if (post) return list.push(post)
      console.warn(
        '[CACHE]',
        `Post ${uuid} is not in cache, but was required by recents list`
      )
    })
    return list
  }
  return getPostList({ limit: 25, offset: 0 })
}
