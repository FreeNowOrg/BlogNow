import axios from 'axios'
import { ref } from 'vue'
import { API_BASE } from '../config'
import { DbUserDoc } from '../types/Database'

export const userData = ref<DbUserDoc | null>(null)

export async function userLogin({
  username,
  password,
}: {
  username: string
  password: string
}): Promise<DbUserDoc> {
  const { data }: any = await axios.post(`${API_BASE}/user/auth/sign-in`, {
    username,
    password,
  })
  userData.value = data.body.profile
  return data
}

export async function initUserData(): Promise<DbUserDoc> {
  console.log('getUserDataByToken')
  const { data }: any = await axios.get(`${API_BASE}/user/auth/profile`)
  console.log('profile', data.body.profile)
  userData.value = data.body.profile
  return data
}
