import { ObjectId } from 'mongodb'
import { ContentType, ReportReason, ReportStatus } from '../request/Moderation.request'

export interface ReportRecord {
  _id?: ObjectId
  content_id: ObjectId
  content_type: ContentType
  reporter_id: ObjectId
  reason: ReportReason
  description?: string
  status: ReportStatus
  created_at: Date
  updated_at: Date
  moderator_id?: ObjectId
  moderator_note?: string
}

export class Report {
  _id?: ObjectId
  content_id: ObjectId
  content_type: ContentType
  reporter_id: ObjectId
  reason: ReportReason
  description?: string
  status: ReportStatus
  created_at: Date
  updated_at: Date
  moderator_id?: ObjectId
  moderator_note?: string

  constructor(report: ReportRecord) {
    this._id = report._id
    this.content_id = report.content_id
    this.content_type = report.content_type
    this.reporter_id = report.reporter_id
    this.reason = report.reason
    this.description = report.description
    this.status = report.status
    this.created_at = report.created_at
    this.updated_at = report.updated_at
    this.moderator_id = report.moderator_id
    this.moderator_note = report.moderator_note
  }
}
