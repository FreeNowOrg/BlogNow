import axios from 'axios'
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

export async function getUserDataByLogin({
  username,
  password,
}: {
  username: string
  password: string
}) {
  const { data }: any = await axios.post('/api/user/sign-in', {
    username,
    password,
  })
  userData.value = data.body.profile
  return data
}

export async function getUserDataByToken() {
  const { data }: any = await axios.get('/api/user/profile')
  userData.value = data.body.profile
  return data
}
