import { ref } from 'vue'
export const userData = ref<{
  uuid: string
  uid: number
  username: string
  email: string
  created_at: string
  nickname: string
  slogan: string
  gender: 'male' | 'female' | 'other'
  avatar: string
  authority: number
  title: string
} | null>(null)
