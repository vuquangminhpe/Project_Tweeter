import { ParamsDictionary } from 'express-serve-static-core'

export interface GetConversationsParams extends ParamsDictionary {
  receiver_id: string
}

export interface GetAllConversationsParams extends ParamsDictionary {
  user_id: string
  limit: string
  page: string
}
