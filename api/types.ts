// User
export interface DatabaseUser {
  _id: string
  uid: string
  username: string
  passwordHash: string
  userGroups: UserGroup[]
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
    latest?: true
    title: string
    content: string
    editor: string
    modified: string
  }[]
}
