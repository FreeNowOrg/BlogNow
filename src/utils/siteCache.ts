import axios from 'axios'
import { ref } from 'vue'
import { API_BASE } from '../config'
import type { ApiResponsePost, ApiResponseUser } from '../types'

export const siteCache = ref({
  meta: {} as Record<string, any>,
  posts: [] as ApiResponsePost[],
  users: [] as ApiResponseUser[],
  recents: [] as string[],
})

// Post
export function setPostCache(post: ApiResponsePost) {
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
  selector: 'uuid' | 'pid' | 'slug',
  target: string | number,
  noCache?: boolean
): Promise<ApiResponsePost> {
  const cache = siteCache.value.posts.find((i) => i[selector] === target)
  if (cache && !noCache) {
    console.info('[CACHE]', 'Get post from cache')
    return cache
  }
  console.info('[CACHE]', 'Get post from origin')
  const { data }: any = await axios.get(
    `${API_BASE}/post/${selector}/${target}`
  )
  setPostCache(data.body.post)
  return data.body.post
}

export async function getPostList({ limit = 25, offset = 0 }) {
  const { data }: any = await axios.get(`${API_BASE}/post/list/recent`, {
    params: { limit, offset },
  })

  const posts: ApiResponsePost[] = data.body.posts || []

  if (offset === 0 && posts.length > 0) {
    console.info('[CACHE]', 'Set recents')
    siteCache.value.recents = posts.map(({ uuid }) => uuid)
  }

  posts.forEach(setPostCache)

  return posts
}

export async function getRecentPosts(
  noCache?: boolean
): Promise<ApiResponsePost[]> {
  const list: ApiResponsePost[] = []
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

// User
export function setUserCache(user: ApiResponseUser) {
  const index = siteCache.value.users.findIndex(
    ({ uuid }) => uuid === user.uuid
  )
  if (index < 0) {
    console.info('[CACHE]', 'Update user cache')
    siteCache.value.users.push(user)
  } else {
    console.info('[CACHE]', 'Set user cache')
    siteCache.value.users[index] = user
  }
  return true
}

export async function getUser(
  selector: 'uuid' | 'uid' | 'username',
  target: string | number,
  noCache?: boolean
): Promise<ApiResponseUser> {
  const cache = siteCache.value.users.find((i) => i[selector] === target)
  if (cache && !noCache) {
    console.info('[CACHE]', 'Get user from cache')
    return cache
  }
  console.info('[CACHE]', 'Get user from origin')
  const { data }: any = await axios.get(
    `${API_BASE}/user/${selector}/${target}`
  )
  setUserCache(data.body.user)
  return data.body.user
}

export async function getUserList(
  selector: 'uuid' | 'uid' | 'username',
  users: string[]
) {
  const { data }: any = await axios.get(
    `${API_BASE}/users/${selector}/${users.join(',')}`
  )

  const list: ApiResponseUser[] = data.body.users || []

  list.forEach(setUserCache)

  return list
}
