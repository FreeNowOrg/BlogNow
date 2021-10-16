import axios from 'axios'
import { ref } from 'vue'
import { getErrMsg, globalInitErrors } from '.'
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
  console.log('Get userData by token')
  return axios.get(`${API_BASE}/user/auth/profile`).then(
    ({ data }: any) => {
      const profile = data.body.profile
      console.info('Current user', profile)
      userData.value = profile
      return profile
    },
    (e) => {
      if (e?.response?.status === 401) {
        console.info('Anonymous')
        return e?.response?.data?.body?.profile
      } else {
        const content = getErrMsg(e)
        console.warn(content)
        globalInitErrors.value.push({
          title: 'Failed to get user data',
          content,
        })
        return null
      }
    }
  )
}
