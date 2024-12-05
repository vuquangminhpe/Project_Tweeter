import { user_info_comment } from './Utils.type'

export interface Comment {
  comments: CommentRequest[]
  page: number
  total_pages: number
}

export interface CommentRequest {
  _id: string
  user_id: string
  tweet_id: string
  commentContent: string
  commentLink: commentLinkType[]
  createdAt: string
  updatedAt: string
  user_info: user_info_comment
}
export interface commentLinkType {
  url: string
  type: number
}
