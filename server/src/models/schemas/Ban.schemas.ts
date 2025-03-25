import { ObjectId } from 'mongodb'
import { BanDurationType } from '../request/Moderation.request'

export interface BanRecord {
  _id?: ObjectId
  user_id: ObjectId
  banned_by: ObjectId
  reason: string
  duration_type: BanDurationType
  duration_days?: number
  ban_date: Date
  unban_date?: Date
  is_active: boolean
  unban_reason?: string
  unbanned_by?: ObjectId
}

export class Ban {
  _id?: ObjectId
  user_id: ObjectId
  banned_by: ObjectId
  reason: string
  duration_type: BanDurationType
  duration_days?: number
  ban_date: Date
  unban_date?: Date
  is_active: boolean
  unban_reason?: string
  unbanned_by?: ObjectId

  constructor(ban: BanRecord) {
    this._id = ban._id
    this.user_id = ban.user_id
    this.banned_by = ban.banned_by
    this.reason = ban.reason
    this.duration_type = ban.duration_type
    this.duration_days = ban.duration_days
    this.ban_date = ban.ban_date
    this.unban_date = ban.unban_date
    this.is_active = ban.is_active
    this.unban_reason = ban.unban_reason
    this.unbanned_by = ban.unbanned_by
  }
}
