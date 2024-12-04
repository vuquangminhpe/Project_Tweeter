interface CommentStatus {
  url: string
  type: number
}

interface CommentType {
  _id: string
  user: string
  tweet: string
  comment: CommentStatus[]
  createdAt: string
  updatedAt: string
}

class Comment {
  _id: string
  user: string
  tweet: string
  comment: CommentStatus[]
  createdAt: string
  updatedAt: string
  constructor(
    _id: string,
    user: string,
    tweet: string,
    comment: CommentStatus[],
    createdAt: string,
    updatedAt: string
  ) {
    this._id = _id
    this.user = user
    this.tweet = tweet
    this.comment = comment
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
export default Comment
