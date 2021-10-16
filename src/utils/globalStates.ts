import axios from 'axios'
import { computed, ref } from 'vue'
import { getErrMsg, userData } from '.'
import { API_BASE } from '../config'
import type { DbPostDoc } from '../types/Database'

// Site meta
export interface SiteMetaType {
  total_posts: number
  total_users: number
  total_tags: number
  founded_at: string
  latest_post: Partial<DbPostDoc>
}
export const siteMeta = ref<SiteMetaType | null>(null)
export async function getSiteMeta(): Promise<SiteMetaType> {
  return axios.get(`${API_BASE}/site/meta`).then(
    ({ data }: any) => {
      const meta = data.body.meta
      siteMeta.value = meta
      return meta
    },
    (e) => {
      const content = getErrMsg(e)
      globalInitErrors.value.push({ title: 'Failed to get site meta', content })
      return null
    }
  )
}

export const globalInitDone = computed(
  () => !!(userData.value.uuid !== undefined && siteMeta.value)
)
export const globalInitErrors = ref<{ title?: string; content: string }[]>([])
