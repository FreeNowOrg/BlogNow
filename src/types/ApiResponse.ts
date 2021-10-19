import { DbPostDoc, DbUserDoc } from './Database'

export type ApiResponse<
  BODY extends unknown,
  CUSTOM_BODY extends unknown = {}
> = {
  status: number
  message: string
  body: BODY
} & CUSTOM_BODY

export type ApiResponsePost = DbPostDoc & {
  cover: string
  author: DbUserDoc & { not_exist?: true }
  editor: DbUserDoc & { not_exist?: true }
}

export type ApiResponseUser = DbUserDoc
