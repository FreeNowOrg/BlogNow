export interface DbConfigDoc {
  key: string
  val: any
}

export type DbConfigCol = DbConfigDoc[]

export interface DbPostDoc {
  uuid: string
  pid: number
  slug: string
  title: string
  content: string
  created_at: string
  author_uuid: string
  edited_at: string
  editor_uuid: string
}

export interface DbUserDoc {
  uuid: string
  uid: number
  username: string
  email: string
  created_at: string
  nickname: string
  slogan: string
  gender: 'male' | 'female' | 'other'
  avatar: string
  password_hash: string
  token: string
  token_expires: number
  authority: number
  title: string
}

export interface DbAuthorityDoc {
  key: DbAuthorityKeys
  authority: number
  display_name?: string
}

// Authority
export type AuthorityPost = 'post_create' | 'post_edit_any' | 'post_delete_any'
export type AuthorityComment =
  | 'comment_create'
  | 'comment_edit_any'
  | 'comment_delete_any'
  | 'comment_protect'
export type AuthorityUser =
  | 'user_register'
  | 'user_block'
  | 'user_unblock_self'
  | 'user_admin'
  | 'user_group_edit'
export type AuthoritySite = 'site_admin'
export type DbAuthorityKeys =
  | AuthorityComment
  | AuthorityPost
  | AuthorityUser
  | AuthoritySite
