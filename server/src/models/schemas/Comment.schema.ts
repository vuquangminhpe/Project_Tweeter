import { ObjectId } from 'mongodb'
import { MediaTypeQuery } from '~/constants/enums'

export interface CommentStatus {
  url: string
  type: MediaTypeQuery
}

interface CommentType {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  commentContent: string
  commentLink?: CommentStatus[]
  createdAt?: Date
  updatedAt?: Date
}

class Comment {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  commentContent: string
  commentLink?: CommentStatus[]
  createdAt?: Date
  updatedAt?: Date
  constructor({ _id, user_id, tweet_id, commentContent, commentLink, createdAt, updatedAt }: CommentType) {
    const date = new Date()
    this._id = _id
    this.user_id = user_id
    this.tweet_id = tweet_id
    this.commentContent = commentContent
    this.commentLink = commentLink
    this.createdAt = createdAt || date
    this.updatedAt = updatedAt || date
  }
}
export default Comment
