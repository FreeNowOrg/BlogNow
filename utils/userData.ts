import axios from 'axios'
import { ref, computed } from 'vue'
import { getErrMsg, globalInitErrors } from '.'
import { API_BASE } from '../config'
import { DbUserDoc } from '../types/Database'

export const userData = ref({} as DbUserDoc)
export const isLoggedIn = computed<boolean>(
  () => !!(userData.value && userData.value.uid > 0 && userData.value.uuid)
)

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
        const profile = e?.response?.data?.body?.profile
        console.info('Anonymous', profile)
        userData.value = profile
        return profile
      } else {
        const content = getErrMsg(e)
        console.warn('Failed to get user data', e)
        globalInitErrors.value.push({
          title: 'Failed to get user data',
          content,
        })
        return null
      }
    }
  )
}
