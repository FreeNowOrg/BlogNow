import axios from 'axios'
import { version } from '../package.json'

export const ENV = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'
export const API_BASE =
  ENV === 'prod' ? '/api' : 'https://blog-now.vercel.app/api'
export const PROJECT_NAME = 'Blog Now'
export const VERSION = version

// Copyright
export const GITHUB_OWNER = 'FreeNowOrg'
export const GITHUB_REPO = 'BlogNow'
export const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`
const year = new Date().getFullYear()
export const COPYRIGHT_YEAR = 2021
export const COPYRIGHT_STR =
  year === COPYRIGHT_YEAR ? COPYRIGHT_YEAR : `${COPYRIGHT_YEAR} - ${year}`

// Inject axios
axios.interceptors.request.use(
  (req) => {
    if (ENV !== 'prod') {
      req.headers = req.headers || {}
      try {
        req.headers.authorization = window.Cookies.get('PICA_TOKEN') || ''
        console.info('[Axios]', 'Request with local token')
      } catch (err) {
        console.warn('[Axios]', 'Inject error', err)
      }
    }
    return req
  },
  (e) => Promise.reject(e)
)
