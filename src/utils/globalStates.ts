import axios from 'axios'
import { ref } from 'vue'
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
  const { data }: any = await axios.get(`${API_BASE}/site/meta`)
  const meta = data?.body?.meta
  siteMeta.value = meta
  return meta
}
