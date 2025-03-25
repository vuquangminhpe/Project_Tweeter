import { ObjectId } from 'mongodb'

export enum ContentType {
  TWEET = 'tweet',
  COMMENT = 'comment',
  USER_BIO = 'user_bio',
  STORY = 'story'
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  IGNORED = 'ignored',
  REMOVED = 'removed'
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  ILLEGAL_CONTENT = 'illegal_content',
  MISINFORMATION = 'misinformation',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  OTHER = 'other'
}

export enum BanDurationType {
  TEMPORARY = 'temporary',
  PERMANENT = 'permanent'
}

export interface ReportContentBody {
  content_id: string
  content_type: ContentType
  reason: ReportReason
  description?: string
}
export interface ContentModerationQuery {
  content_type?: ContentType
  status?: ReportStatus
  from_date?: string
  to_date?: string
  page?: string
  limit?: string
}

export interface ModerateContentBody {
  report_id: string
  action: ReportStatus
  reason?: string
}

export interface BanUserBody {
  user_id: string
  reason: string
  duration_type: BanDurationType
  duration_days?: number
}

export interface UnbanUserBody {
  user_id: string
  reason: string
}

export interface GetBanHistoryParams {
  user_id: string
}

export interface ToxicContentDetectionResult {
  content_id: string
  content_type: ContentType
  content_text: string
  toxic_score: number
  hate_score: number
  threat_score: number
  sexual_score: number
  profanity_score: number
  is_flagged: boolean
}
