import { DbCommentDoc } from '.'
import { DbPostDoc, DbUserDoc } from './Database'

export type ApiResponse<
  BODY extends unknown,
  CUSTOM_BODY extends unknown = {}
> = {
  status: number
  message: string
  body: BODY
} & CUSTOM_BODY

export interface ApiAttachedUser {
  author: ApiResponseUser
  editor: ApiResponseUser
}

export type ApiResponseComment = DbCommentDoc & ApiAttachedUser
export type ApiResponseCommentList = {
  comments: ApiResponseComment[]
  total_comments: number
  limit: number
  offset: number
  has_next: number
}

export type ApiResponsePost = DbPostDoc &
  ApiAttachedUser & {
    cover: string
  }

export type ApiResponseUser = DbUserDoc & { not_exist?: true }
