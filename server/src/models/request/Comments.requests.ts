import { CommentStatus } from '../schemas/Comment.schema'

export interface getCommentTweetReqBody {
  tweet_id: string
  commentContent: string
  commentLink: CommentStatus[]
}
