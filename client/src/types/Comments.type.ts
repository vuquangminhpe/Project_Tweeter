export interface Comment {
  comment: CommentRequest[]
  page: 1
  total_pages: 1
}

export interface CommentRequest {
  _id: string
  user_id: string
  tweet_id: string
  commentContent: string
  commentLink: commentLinkType[]
  createdAt: string
  updatedAt: string
}
export interface commentLinkType {
  url: string
  type: number
}
