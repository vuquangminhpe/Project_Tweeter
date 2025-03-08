import { ObjectId } from 'mongodb'
import { ActionType, NotificationStatus } from '~/constants/enums'

interface NotificationType {
  _id?: ObjectId
  userId: ObjectId
  senderId: ObjectId
  actionType: ActionType
  targetId: string // All Nội dung của thông báo
  content: string
  timestamp: Date
  status: NotificationStatus
}

export class Notification {
  _id?: ObjectId
  userId: ObjectId
  senderId: ObjectId
  actionType: ActionType
  targetId: string
  content: string
  timestamp?: Date
  status: NotificationStatus

  constructor({ _id, userId, senderId, actionType, targetId, content, timestamp, status }: NotificationType) {
    this._id = _id
    this.userId = userId
    this.senderId = senderId
    this.actionType = actionType
    this.targetId = targetId
    this.content = content
    this.timestamp = timestamp
    this.status = status
  }
}
