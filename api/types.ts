// User
export interface DatabaseUser {
  _id: string
  uid: number
  username: string
  passwordHash: string
  registrationTime: number
  userGroups: UserGroup[]
  postNumber: number
  lastActiveTime: number
  lastTokenJti: string
}

export type UserGroup = '*' | 'member' | 'moderator' | 'admin'

// Post
export interface DatabasePost {
  _id: string
  pid: string
  slugs: string[]
  author: string
  title: string
  content: string
  time: {
    published: string
    modified: string
  }
  categories: string[]
  contentHistory: {
    latest?: boolean
    title: string
    content: string
    editor: string
    modified: string
  }[]
}
