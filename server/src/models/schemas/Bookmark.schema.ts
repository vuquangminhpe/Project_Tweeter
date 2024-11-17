import { ObjectId } from 'mongodb'

export interface bookmarkType {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}
export class Bookmark {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
  constructor({ _id, user_id, tweet_id, created_at }: bookmarkType) {
    this._id = _id
    this.user_id = user_id
    this.tweet_id = tweet_id
    this.created_at = created_at || new Date()
  }
}
