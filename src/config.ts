import { version } from '../package.json'

export const SITE_ENV = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'
export const API_BASE =
  SITE_ENV === 'prod' ? '/api' : 'https://blog-now.vercel.app/api'
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
