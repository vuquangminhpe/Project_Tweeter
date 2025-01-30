import { ObjectId } from 'bson'

interface ConversationType {
  _id?: ObjectId
  sender_id: ObjectId
  receive_id: ObjectId
  content: string
  emoji?: number

  created_at?: Date
  updated_at?: Date
}
export default class Conversations {
  _id?: ObjectId
  sender_id: ObjectId
  receive_id: ObjectId
  content: string
  emoji?: number

  created_at?: Date
  updated_at?: Date
  constructor({ _id, sender_id, receive_id, content, emoji, created_at, updated_at }: ConversationType) {
    const date = new Date()
    this._id = _id
    this.sender_id = sender_id
    this.receive_id = receive_id
    this.content = content
    this.emoji = emoji
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
