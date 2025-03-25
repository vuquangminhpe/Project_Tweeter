import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import databaseService from './database.services'
import { BanDurationType, ContentType, ReportReason, ReportStatus } from '~/models/request/Moderation.request'
import { Report } from '~/models/schemas/Report.schemas'
import { Ban } from '~/models/schemas/Ban.schemas'
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

export interface ReportContentBody {
  content_id: string
  content_type: ContentType
  reason: ReportReason
  description?: string
}

interface ToxicContentDetectionResult {
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

class ContentModerationService {
  async getReportedContent(query: ContentModerationQuery) {
    const { content_type, status, from_date, to_date, page = '1', limit = '10' } = query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum
    const filter: any = {}

    if (content_type) {
      filter.content_type = content_type
    }

    if (status) {
      filter.status = status
    }

    if (from_date || to_date) {
      filter.created_at = {}

      if (from_date) {
        filter.created_at.$gte = new Date(from_date)
      }

      if (to_date) {
        filter.created_at.$lte = new Date(to_date)
      }
    }

    const reports = await databaseService.reports
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray()

    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        let content = null
        let reporter = null

        try {
          reporter = await databaseService.users.findOne(
            { _id: report.reporter_id },
            { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
          )
        } catch (err) {
          console.error(`Error fetching reporter: ${err}`)
        }

        try {
          if (report.content_type === ContentType.TWEET || report.content_type === ContentType.COMMENT) {
            content = await databaseService.tweets.findOne({ _id: report.content_id })

            if (content) {
              const contentUser = await databaseService.users.findOne(
                { _id: content.user_id },
                { projection: { name: 1, username: 1, avatar: 1 } }
              )

              content = {
                ...content,
                user: contentUser
              }
            }
          } else if (report.content_type === ContentType.USER_BIO) {
            content = await databaseService.users.findOne(
              { _id: report.content_id },
              { projection: { bio: 1, name: 1, username: 1, avatar: 1 } }
            )
          } else if (report.content_type === ContentType.STORY) {
            content = await databaseService.stories.findOne({ _id: report.content_id })

            if (content) {
              const contentUser = await databaseService.users.findOne(
                { _id: content.user_id },
                { projection: { name: 1, username: 1, avatar: 1 } }
              )

              content = {
                ...content,
                user: contentUser
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching content: ${err}`)
        }

        return {
          ...report,
          content,
          reporter: reporter
            ? {
                _id: reporter._id,
                name: reporter.name,
                username: reporter.username,
                avatar: reporter.avatar
              }
            : null
        }
      })
    )

    const totalReports = await databaseService.reports.countDocuments(filter)

    return {
      reports: enrichedReports,
      pagination: {
        total: totalReports,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(totalReports / limitNum)
      }
    }
  }

  async reportContent(reporterUserId: string, reportData: ReportContentBody) {
    const { content_id, content_type, reason, description } = reportData

    const report = new Report({
      content_id: new ObjectId(content_id),
      content_type,
      reporter_id: new ObjectId(reporterUserId),
      reason,
      description,
      status: ReportStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date()
    })

    const result = await databaseService.reports.insertOne(report)

    return {
      _id: result.insertedId,
      ...report
    }
  }

  async moderateContent(moderatorId: string, moderationData: ModerateContentBody) {
    const { report_id, action, reason } = moderationData

    const updateResult = await databaseService.reports.findOneAndUpdate(
      { _id: new ObjectId(report_id) },
      {
        $set: {
          status: action,
          moderator_id: new ObjectId(moderatorId),
          moderator_note: reason,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    if (!updateResult) {
      throw new Error('Report not found')
    }

    const report = updateResult

    if (action === ReportStatus.REMOVED) {
      await this.removeReportedContent(report.content_type, report.content_id.toString())
    }

    return {
      success: true,
      report: updateResult
    }
  }

  private async removeReportedContent(contentType: ContentType, contentId: string) {
    const objectId = new ObjectId(contentId)

    switch (contentType) {
      case ContentType.TWEET:
        await databaseService.tweets.updateOne(
          { _id: objectId },
          {
            $set: {
              removed: true,
              removed_at: new Date()
            }
          }
        )
        break

      case ContentType.COMMENT:
        await databaseService.tweets.updateOne(
          { _id: objectId },
          {
            $set: {
              removed: true,
              removed_at: new Date()
            }
          }
        )
        break

      case ContentType.USER_BIO:
        await databaseService.users.updateOne(
          { _id: objectId },
          {
            $set: {
              bio: '[Removed by moderator]'
            }
          }
        )
        break

      case ContentType.STORY:
        await databaseService.stories.updateOne(
          { _id: objectId },
          {
            $set: {
              is_active: false,
              removed: true,
              removed_at: new Date()
            }
          }
        )
        break
    }
  }

  async getComments(query: ContentModerationQuery) {
    const { from_date, to_date, page = '1', limit = '10' } = query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const filter: any = {
      type: 2
    }

    if (from_date || to_date) {
      filter.created_at = {}

      if (from_date) {
        filter.created_at.$gte = new Date(from_date)
      }

      if (to_date) {
        filter.created_at.$lte = new Date(to_date)
      }
    }

    const comments = await databaseService.tweets
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray()

    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        let user = null
        let parentTweet = null

        try {
          user = await databaseService.users.findOne(
            { _id: comment.user_id },
            { projection: { name: 1, username: 1, avatar: 1 } }
          )
        } catch (err) {
          console.error(`Error fetching user: ${err}`)
        }

        try {
          if (comment.parent_id) {
            parentTweet = await databaseService.tweets.findOne({ _id: comment.parent_id })
          }
        } catch (err) {
          console.error(`Error fetching parent tweet: ${err}`)
        }

        return {
          ...comment,
          user,
          parent_tweet: parentTweet
        }
      })
    )

    const totalComments = await databaseService.tweets.countDocuments(filter)

    return {
      comments: enrichedComments,
      pagination: {
        total: totalComments,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(totalComments / limitNum)
      }
    }
  }

  async removeComment(commentId: string, moderatorId: string, reason: string) {
    const objectId = new ObjectId(commentId)

    const comment = await databaseService.tweets.findOne({ _id: objectId, type: 2 })

    if (!comment) {
      throw new Error('Comment not found')
    }

    await databaseService.tweets.updateOne(
      { _id: objectId },
      {
        $set: {
          removed: true,
          removed_at: new Date(),
          moderator_id: new ObjectId(moderatorId),
          removal_reason: reason
        }
      }
    )

    return {
      success: true,
      message: 'Comment removed successfully'
    }
  }

  async banUser(adminId: string, banData: BanUserBody) {
    const { user_id, reason, duration_type, duration_days } = banData

    if (duration_type === BanDurationType.TEMPORARY && (!duration_days || duration_days <= 0)) {
      throw new Error('Duration days must be provided and greater than 0 for temporary bans')
    }

    const userId = new ObjectId(user_id)

    const user = await databaseService.users.findOne({ _id: userId })

    if (!user) {
      throw new Error('User not found')
    }

    const banRecord = new Ban({
      user_id: userId,
      banned_by: new ObjectId(adminId),
      reason,
      duration_type,
      is_active: true,
      duration_days: duration_type === BanDurationType.TEMPORARY ? duration_days : undefined,
      ban_date: new Date(),
      unban_date:
        duration_type === BanDurationType.TEMPORARY
          ? new Date(Date.now() + (duration_days || 0) * 24 * 60 * 60 * 1000)
          : undefined
    })

    const insertResult = await databaseService.bans.insertOne(banRecord)

    await databaseService.users.updateOne(
      { _id: userId },
      {
        $set: {
          verify: UserVerifyStatus.Banned,
          ban_record_id: insertResult.insertedId
        }
      }
    )

    return {
      success: true,
      ban_record: {
        _id: insertResult.insertedId,
        ...banRecord
      }
    }
  }

  async unbanUser(adminId: string, unbanData: UnbanUserBody) {
    const { user_id, reason } = unbanData

    const userId = new ObjectId(user_id)

    const user = await databaseService.users.findOne({ _id: userId })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.verify !== UserVerifyStatus.Banned) {
      throw new Error('User is not banned')
    }

    const activeBan = await databaseService.bans.findOne({
      user_id: userId,
      is_active: true
    })

    if (!activeBan) {
      throw new Error('No active ban record found')
    }

    await databaseService.bans.updateOne(
      { _id: activeBan._id },
      {
        $set: {
          is_active: false,
          unban_date: new Date(),
          unban_reason: reason,
          unbanned_by: new ObjectId(adminId)
        }
      }
    )

    await databaseService.users.updateOne(
      { _id: userId },
      {
        $set: {
          verify: UserVerifyStatus.Verified
        },
        $unset: {
          ban_record_id: ''
        }
      }
    )

    return {
      success: true,
      message: 'User unbanned successfully'
    }
  }

  async getUserBanHistory(userId: string) {
    const objectId = new ObjectId(userId)

    const user = await databaseService.users.findOne({ _id: objectId })

    if (!user) {
      throw new Error('User not found')
    }

    const banRecords = await databaseService.bans.find({ user_id: objectId }).sort({ ban_date: -1 }).toArray()

    const enrichedBanRecords = await Promise.all(
      banRecords.map(async (record) => {
        let bannedBy = null
        let unbannedBy = null

        try {
          if (record.banned_by) {
            bannedBy = await databaseService.users.findOne(
              { _id: record.banned_by },
              { projection: { name: 1, username: 1 } }
            )
          }

          if (record.unbanned_by) {
            unbannedBy = await databaseService.users.findOne(
              { _id: record.unbanned_by },
              { projection: { name: 1, username: 1 } }
            )
          }
        } catch (err) {
          console.error(`Error fetching admin info: ${err}`)
        }

        return {
          ...record,
          banned_by_info: bannedBy
            ? {
                _id: bannedBy._id,
                name: bannedBy.name,
                username: bannedBy.username
              }
            : null,
          unbanned_by_info: unbannedBy
            ? {
                _id: unbannedBy._id,
                name: unbannedBy.name,
                username: unbannedBy.username
              }
            : null
        }
      })
    )

    return {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        verify: user.verify
      },
      ban_history: enrichedBanRecords
    }
  }

  async detectToxicContent(
    contentId: string,
    contentType: ContentType,
    text: string
  ): Promise<ToxicContentDetectionResult> {
    const offensiveWords = [
      'hate',
      'kill',
      'die',
      'attack',
      'stupid',
      'idiot',
      'dumb',
      'racist',
      'sexist',
      'ugly',
      'fat',
      'ass',
      'bitch',
      'fuck'
    ]

    const lowerText = text.toLowerCase()

    let toxicScore = 0
    let hateScore = 0
    let threatScore = 0
    let sexualScore = 0
    let profanityScore = 0

    offensiveWords.forEach((word) => {
      if (lowerText.includes(word)) {
        toxicScore += 0.2

        if (['hate', 'racist', 'sexist'].includes(word)) {
          hateScore += 0.3
        }

        if (['kill', 'die', 'attack'].includes(word)) {
          threatScore += 0.3
        }

        if (['sex', 'sexy', 'fuck'].includes(word)) {
          sexualScore += 0.3
        }

        if (['ass', 'bitch', 'fuck', 'shit'].includes(word)) {
          profanityScore += 0.3
        }
      }
    })

    toxicScore = Math.min(toxicScore, 1.0)
    hateScore = Math.min(hateScore, 1.0)
    threatScore = Math.min(threatScore, 1.0)
    sexualScore = Math.min(sexualScore, 1.0)
    profanityScore = Math.min(profanityScore, 1.0)

    const isFlagged =
      toxicScore > 0.5 || hateScore > 0.5 || threatScore > 0.5 || sexualScore > 0.5 || profanityScore > 0.5

    const result: ToxicContentDetectionResult = {
      content_id: contentId,
      content_type: contentType,
      content_text: text,
      toxic_score: toxicScore,
      hate_score: hateScore,
      threat_score: threatScore,
      sexual_score: sexualScore,
      profanity_score: profanityScore,
      is_flagged: isFlagged
    }

    if (isFlagged) {
      const systemReportReason = this.determineReportReason(result)

      await this.createSystemReport(contentId, contentType, systemReportReason)
    }

    return result
  }

  private determineReportReason(result: ToxicContentDetectionResult): ReportReason {
    if (result.hate_score > 0.5) {
      return ReportReason.HATE_SPEECH
    } else if (result.threat_score > 0.5) {
      return ReportReason.VIOLENCE
    } else if (result.sexual_score > 0.5) {
      return ReportReason.OTHER
    } else if (result.profanity_score > 0.5) {
      return ReportReason.HARASSMENT
    } else {
      return ReportReason.OTHER
    }
  }

  private async createSystemReport(contentId: string, contentType: ContentType, reason: ReportReason) {
    const systemUserId = new ObjectId('000000000000000000000000')

    const report = new Report({
      content_id: new ObjectId(contentId),
      content_type: contentType,
      reporter_id: systemUserId,
      reason: reason,
      description: 'Automatically flagged by system for potentially harmful content',
      status: ReportStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date()
    })

    await databaseService.reports.insertOne(report)
  }

  async getContentModerationStats() {
    const reportsByStatus = await databaseService.reports
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const reportsByContentType = await databaseService.reports
      .aggregate([
        {
          $group: {
            _id: '$content_type',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const reportsByReason = await databaseService.reports
      .aggregate([
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const reportTrend = await databaseService.reports
      .aggregate([
        {
          $match: {
            created_at: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
      .toArray()

    const bannedUsersCount = await databaseService.users.countDocuments({
      verify: UserVerifyStatus.Banned
    })

    const activeBansCount = await databaseService.bans.countDocuments({
      is_active: true
    })

    const formattedReportsByStatus = {
      pending: 0,
      reviewed: 0,
      ignored: 0,
      removed: 0
    }

    reportsByStatus.forEach((item) => {
      if (item._id === ReportStatus.PENDING) {
        formattedReportsByStatus.pending = item.count
      } else if (item._id === ReportStatus.REVIEWED) {
        formattedReportsByStatus.reviewed = item.count
      } else if (item._id === ReportStatus.IGNORED) {
        formattedReportsByStatus.ignored = item.count
      } else if (item._id === ReportStatus.REMOVED) {
        formattedReportsByStatus.removed = item.count
      }
    })

    const formattedReportsByContentType = {
      tweet: 0,
      comment: 0,
      user_bio: 0,
      story: 0
    }

    reportsByContentType.forEach((item) => {
      if (item._id === ContentType.TWEET) {
        formattedReportsByContentType.tweet = item.count
      } else if (item._id === ContentType.COMMENT) {
        formattedReportsByContentType.comment = item.count
      } else if (item._id === ContentType.USER_BIO) {
        formattedReportsByContentType.user_bio = item.count
      } else if (item._id === ContentType.STORY) {
        formattedReportsByContentType.story = item.count
      }
    })

    return {
      reports_by_status: formattedReportsByStatus,
      reports_by_content_type: formattedReportsByContentType,
      reports_by_reason: reportsByReason,
      report_trend: reportTrend,
      banned_users_count: bannedUsersCount,
      active_bans_count: activeBansCount
    }
  }
}

const contentModerationService = new ContentModerationService()
export default contentModerationService
