import { ObjectId } from 'mongodb'
import { AccountStatus, TweetType, UserVerifyStatus } from '../constants/enums'
import {
  UserStatsQuery,
  ContentStatsQuery,
  InteractionStatsQuery,
  RevenueStatsQuery,
  SystemStatsQuery,
  AdminUserListQuery
} from '../models/request/Admin.request'
import databaseService from './database.services'
import { AdminReportType, StatInterval } from '../constants/messages'
import { UserRole } from '../models/schemas/User.schema'

class AdminService {
  async getUserStatistics(query: UserStatsQuery) {
    const { from_date, to_date, interval, account_type, verification_status } = query

    const dateFilter: any = {}
    if (from_date) {
      dateFilter.created_at = { $gte: new Date(from_date) }
    }
    if (to_date) {
      dateFilter.created_at = { ...dateFilter.created_at, $lte: new Date(to_date) }
    }

    const accountTypeFilter: any = {}
    if (account_type) {
      accountTypeFilter.typeAccount = parseInt(account_type)
    }

    const verificationFilter: any = {}
    if (verification_status) {
      verificationFilter.verify = parseInt(verification_status as string)
    }

    const filter = {
      ...dateFilter,
      ...accountTypeFilter,
      ...verificationFilter
    }

    const totalUsers = await databaseService.users.countDocuments(filter)

    const usersByVerification = await databaseService.users
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$verify',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const usersByAccountType = await databaseService.users
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$typeAccount',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const userGrowth = await this.getUserGrowthByInterval(interval || StatInterval.MONTHLY, from_date, to_date)

    return {
      total_users: totalUsers,
      by_verification_status: this.formatVerificationStats(usersByVerification),
      by_account_type: this.formatAccountTypeStats(usersByAccountType),
      growth_over_time: userGrowth
    }
  }

  private formatVerificationStats(stats: any[]) {
    const result: Record<string, number> = {
      unverified: 0,
      verified: 0,
      banned: 0
    }

    stats.forEach((stat) => {
      if (stat._id === UserVerifyStatus.Unverified) {
        result.unverified = stat.count
      } else if (stat._id === UserVerifyStatus.Verified) {
        result.verified = stat.count
      } else if (stat._id === UserVerifyStatus.Banned) {
        result.banned = stat.count
      }
    })

    return result
  }

  private formatAccountTypeStats(stats: any[]) {
    const result: Record<string, number> = {
      free: 0,
      premium: 0,
      platinum: 0
    }

    stats.forEach((stat) => {
      if (stat._id === AccountStatus.FREE) {
        result.free = stat.count
      } else if (stat._id === AccountStatus.PREMIUM) {
        result.premium = stat.count
      } else if (stat._id === AccountStatus.PLATINUM) {
        result.platinum = stat.count
      }
    })

    return result
  }

  private async getUserGrowthByInterval(interval: StatInterval, from_date?: string, to_date?: string) {
    const dateFormat = this.getDateFormatByInterval(interval)
    const fromDate = from_date ? new Date(from_date) : new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    const toDate = to_date ? new Date(to_date) : new Date()

    const growth = await databaseService.users
      .aggregate([
        {
          $match: {
            created_at: { $gte: fromDate, $lte: toDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: dateFormat, date: '$created_at' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
      .toArray()

    return growth.map((item) => ({
      date: item._id,
      new_users: item.count
    }))
  }

  private getDateFormatByInterval(interval: StatInterval) {
    switch (interval) {
      case StatInterval.DAILY:
        return '%Y-%m-%d'
      case StatInterval.WEEKLY:
        return '%Y-%U'
      case StatInterval.MONTHLY:
        return '%Y-%m'
      default:
        return '%Y-%m'
    }
  }

  async getContentStatistics(query: ContentStatsQuery) {
    const { from_date, to_date, interval, content_type, has_media } = query

    const dateFilter: any = {}
    if (from_date) {
      dateFilter.created_at = { $gte: new Date(from_date) }
    }
    if (to_date) {
      dateFilter.created_at = { ...dateFilter.created_at, $lte: new Date(to_date) }
    }

    const contentTypeFilter: any = {}
    if (content_type) {
      contentTypeFilter.type = parseInt(content_type)
    }

    const mediaFilter: any = {}
    if (has_media !== undefined) {
      const mediaCondition = has_media === 'true' ? { $gt: 0 } : { $eq: 0 }
      mediaFilter['medias.0'] = mediaCondition
    }

    const filter = {
      ...dateFilter,
      ...contentTypeFilter,
      ...mediaFilter
    }

    const totalTweets = await databaseService.tweets.countDocuments(filter)

    const tweetsByType = await databaseService.tweets
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const tweetsWithMedia = await databaseService.tweets.countDocuments({
      ...filter,
      'medias.0': { $exists: true }
    })

    const tweetGrowth = await this.getTweetGrowthByInterval(interval || StatInterval.MONTHLY, from_date, to_date)

    const popularHashtags = await this.getPopularHashtags(from_date, to_date)

    return {
      total_tweets: totalTweets,
      tweets_with_media: tweetsWithMedia,
      by_tweet_type: this.formatTweetTypeStats(tweetsByType),
      growth_over_time: tweetGrowth,
      popular_hashtags: popularHashtags
    }
  }

  private formatTweetTypeStats(stats: any[]) {
    const result: Record<string, number> = {
      tweet: 0,
      retweet: 0,
      comment: 0,
      quote_tweet: 0
    }

    stats.forEach((stat) => {
      if (stat._id === TweetType.Tweet) {
        result.tweet = stat.count
      } else if (stat._id === TweetType.Retweet) {
        result.retweet = stat.count
      } else if (stat._id === TweetType.Comment) {
        result.comment = stat.count
      } else if (stat._id === TweetType.QuoteTweet) {
        result.quote_tweet = stat.count
      }
    })

    return result
  }

  private async getTweetGrowthByInterval(interval: StatInterval, from_date?: string, to_date?: string) {
    const dateFormat = this.getDateFormatByInterval(interval)
    const fromDate = from_date ? new Date(from_date) : new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    const toDate = to_date ? new Date(to_date) : new Date()

    const growth = await databaseService.tweets
      .aggregate([
        {
          $match: {
            created_at: { $gte: fromDate, $lte: toDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: dateFormat, date: '$created_at' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
      .toArray()

    return growth.map((item) => ({
      date: item._id,
      new_tweets: item.count
    }))
  }

  private async getPopularHashtags(from_date?: string, to_date?: string) {
    const dateFilter: any = {}
    if (from_date) {
      dateFilter.created_at = { $gte: new Date(from_date) }
    }
    if (to_date) {
      dateFilter.created_at = { ...dateFilter.created_at, $lte: new Date(to_date) }
    }

    const hashtagStats = await databaseService.tweets
      .aggregate([
        { $match: dateFilter },
        { $unwind: '$hashtags' },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtag_info'
          }
        },
        { $unwind: '$hashtag_info' },
        {
          $group: {
            _id: '$hashtag_info.name',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
      .toArray()

    return hashtagStats.map((item) => ({
      hashtag: item._id,
      count: item.count
    }))
  }

  async getInteractionStatistics(query: InteractionStatsQuery) {
    const { from_date, to_date, interval, interaction_type } = query

    const dateFilter: any = {}
    if (from_date) {
      dateFilter.created_at = { $gte: new Date(from_date) }
    }
    if (to_date) {
      dateFilter.created_at = { ...dateFilter.created_at, $lte: new Date(to_date) }
    }

    const totalLikes = await databaseService.likes.countDocuments(dateFilter)

    const totalBookmarks = await databaseService.bookmarks.countDocuments(dateFilter)

    const totalComments = await databaseService.tweets.countDocuments({
      ...dateFilter,
      type: TweetType.Comment
    })

    const totalFollows = await databaseService.followers.countDocuments(dateFilter)

    const likesOverTime = await this.getLikesGrowthByInterval(interval || StatInterval.MONTHLY, from_date, to_date)
    const bookmarksOverTime = await this.getBookmarksGrowthByInterval(
      interval || StatInterval.MONTHLY,
      from_date,
      to_date
    )
    const commentsOverTime = await this.getCommentsGrowthByInterval(
      interval || StatInterval.MONTHLY,
      from_date,
      to_date
    )

    const topEngagedTweets = await this.getTopEngagedTweets(from_date, to_date)

    return {
      total_likes: totalLikes,
      total_bookmarks: totalBookmarks,
      total_comments: totalComments,
      total_follows: totalFollows,
      interactions_over_time: {
        likes: likesOverTime,
        bookmarks: bookmarksOverTime,
        comments: commentsOverTime
      },
      top_engaged_tweets: topEngagedTweets
    }
  }

  private async getLikesGrowthByInterval(interval: StatInterval, from_date?: string, to_date?: string) {
    const dateFormat = this.getDateFormatByInterval(interval)
    const fromDate = from_date ? new Date(from_date) : new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    const toDate = to_date ? new Date(to_date) : new Date()

    const growth = await databaseService.likes
      .aggregate([
        {
          $match: {
            created_at: { $gte: fromDate, $lte: toDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: dateFormat, date: '$created_at' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
      .toArray()

    return growth.map((item) => ({
      date: item._id,
      count: item.count
    }))
  }

  private async getBookmarksGrowthByInterval(interval: StatInterval, from_date?: string, to_date?: string) {
    const dateFormat = this.getDateFormatByInterval(interval)
    const fromDate = from_date ? new Date(from_date) : new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    const toDate = to_date ? new Date(to_date) : new Date()

    const growth = await databaseService.bookmarks
      .aggregate([
        {
          $match: {
            created_at: { $gte: fromDate, $lte: toDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: dateFormat, date: '$created_at' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
      .toArray()

    return growth.map((item) => ({
      date: item._id,
      count: item.count
    }))
  }

  private async getCommentsGrowthByInterval(interval: StatInterval, from_date?: string, to_date?: string) {
    const dateFormat = this.getDateFormatByInterval(interval)
    const fromDate = from_date ? new Date(from_date) : new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    const toDate = to_date ? new Date(to_date) : new Date()

    const growth = await databaseService.tweets
      .aggregate([
        {
          $match: {
            created_at: { $gte: fromDate, $lte: toDate },
            type: TweetType.Comment
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: dateFormat, date: '$created_at' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
      .toArray()

    return growth.map((item) => ({
      date: item._id,
      count: item.count
    }))
  }

  private async getTopEngagedTweets(from_date?: string, to_date?: string, limit: number = 10) {
    const dateFilter: any = {}
    if (from_date) {
      dateFilter.created_at = { $gte: new Date(from_date) }
    }
    if (to_date) {
      dateFilter.created_at = { ...dateFilter.created_at, $lte: new Date(to_date) }
    }

    const topTweets = await databaseService.tweets
      .aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            let: { tweetId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$parent_id', '$$tweetId'] },
                  type: TweetType.Comment
                }
              }
            ],
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $addFields: {
            likes_count: { $size: '$likes' },
            bookmarks_count: { $size: '$bookmarks' },
            comments_count: { $size: '$comments' },
            total_engagement: { $add: [{ $size: '$likes' }, { $size: '$bookmarks' }, { $size: '$comments' }] }
          }
        },
        {
          $project: {
            _id: 1,
            content: 1,
            created_at: 1,
            type: 1,
            user_name: '$user.name',
            user_username: '$user.username',
            likes_count: 1,
            bookmarks_count: 1,
            comments_count: 1,
            total_engagement: 1
          }
        },
        { $sort: { total_engagement: -1 } },
        { $limit: limit }
      ])
      .toArray()

    return topTweets
  }

  async getRevenueStatistics(query: RevenueStatsQuery) {
    const { from_date, to_date, interval, subscription_type } = query

    const dateFilter: any = {}
    if (from_date) {
      dateFilter.created_at = { $gte: new Date(from_date) }
    }
    if (to_date) {
      dateFilter.created_at = { ...dateFilter.created_at, $lte: new Date(to_date) }
    }

    const subscriptionFilter: any = {}
    if (subscription_type) {
      subscriptionFilter.subscription_type = parseInt(subscription_type)
    }

    const paymentFilter = {
      status: 'SUCCESS'
    }

    const filter = {
      ...dateFilter,
      ...subscriptionFilter,
      ...paymentFilter
    }

    const totalRevenue = await databaseService.payments
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
      .toArray()

    const revenueBySubscriptionType = await databaseService.payments
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$subscription_type',
            total: { $sum: '$amount' }
          }
        }
      ])
      .toArray()

    const revenueOverTime = await this.getRevenueByInterval(interval || StatInterval.MONTHLY, from_date, to_date)

    const conversionRates = await this.getSubscriptionConversionRates(from_date, to_date)

    return {
      total_revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      by_subscription_type: this.formatSubscriptionRevenue(revenueBySubscriptionType),
      revenue_over_time: revenueOverTime,
      conversion_rates: conversionRates
    }
  }

  private formatSubscriptionRevenue(stats: any[]) {
    const result: Record<string, number> = {
      premium: 0,
      platinum: 0
    }

    stats.forEach((stat) => {
      if (stat._id === AccountStatus.PREMIUM) {
        result.premium = stat.total
      } else if (stat._id === AccountStatus.PLATINUM) {
        result.platinum = stat.total
      }
    })

    return result
  }

  private async getRevenueByInterval(interval: StatInterval, from_date?: string, to_date?: string) {
    const dateFormat = this.getDateFormatByInterval(interval)
    const fromDate = from_date ? new Date(from_date) : new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    const toDate = to_date ? new Date(to_date) : new Date()

    const revenue = await databaseService.payments
      .aggregate([
        {
          $match: {
            created_at: { $gte: fromDate, $lte: toDate },
            status: 'SUCCESS'
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: dateFormat, date: '$created_at' } },
              subscription_type: '$subscription_type'
            },
            amount: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ])
      .toArray()

    const result: any = {}

    revenue.forEach((item) => {
      const date = item._id.date
      if (!result[date]) {
        result[date] = {
          date,
          premium: 0,
          platinum: 0
        }
      }

      if (item._id.subscription_type === AccountStatus.PREMIUM) {
        result[date].premium = item.amount
      } else if (item._id.subscription_type === AccountStatus.PLATINUM) {
        result[date].platinum = item.amount
      }
    })

    return Object.values(result)
  }

  private async getSubscriptionConversionRates(from_date?: string, to_date?: string) {
    const dateFilter: any = {}
    if (from_date) {
      dateFilter.created_at = { $gte: new Date(from_date) }
    }
    if (to_date) {
      dateFilter.created_at = { ...dateFilter.created_at, $lte: new Date(to_date) }
    }

    const totalUsers = await databaseService.users.countDocuments(dateFilter)

    const usersByType = await databaseService.users
      .aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$typeAccount',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const freeUsers = usersByType.find((item) => item._id === AccountStatus.FREE)?.count || 0
    const premiumUsers = usersByType.find((item) => item._id === AccountStatus.PREMIUM)?.count || 0
    const platinumUsers = usersByType.find((item) => item._id === AccountStatus.PLATINUM)?.count || 0

    return {
      free_percentage: totalUsers ? (freeUsers / totalUsers) * 100 : 0,
      premium_percentage: totalUsers ? (premiumUsers / totalUsers) * 100 : 0,
      platinum_percentage: totalUsers ? (platinumUsers / totalUsers) * 100 : 0
    }
  }

  async getSystemStatistics(query: SystemStatsQuery) {
    const { from_date, to_date, interval } = query

    const storageUsage = await this.getStorageUsage()

    const dbStats = await this.getDatabaseStats()

    const apiUsage = await this.getMockApiUsage(interval || StatInterval.DAILY, from_date, to_date)

    const errorRates = await this.getMockErrorRates(interval || StatInterval.DAILY, from_date, to_date)

    return {
      storage_usage: storageUsage,
      database_stats: dbStats,
      api_usage: apiUsage,
      error_rates: errorRates
    }
  }

  private async getStorageUsage() {
    const tweetMediaCount = await databaseService.tweets
      .aggregate([{ $unwind: '$medias' }, { $count: 'count' }])
      .toArray()

    const storyMediaCount = await databaseService.stories.countDocuments({
      media_url: { $exists: true, $ne: '' }
    })

    const estimatedTweetMediaSize = (tweetMediaCount.length > 0 ? tweetMediaCount[0].count : 0) * 2 * 1024 * 1024 // 2MB average
    const estimatedStoryMediaSize = storyMediaCount * 4 * 1024 * 1024 // 4MB average

    return {
      total_media_files: (tweetMediaCount.length > 0 ? tweetMediaCount[0].count : 0) + storyMediaCount,
      estimated_storage_used_bytes: estimatedTweetMediaSize + estimatedStoryMediaSize,
      estimated_storage_used_gb: (estimatedTweetMediaSize + estimatedStoryMediaSize) / (1024 * 1024 * 1024)
    }
  }

  private async getDatabaseStats() {
    const [
      userCount,
      tweetCount,
      commentCount,
      likeCount,
      bookmarkCount,
      followerCount,
      storyCount,
      conversationCount
    ] = await Promise.all([
      databaseService.users.countDocuments({}),
      databaseService.tweets.countDocuments({ type: { $ne: TweetType.Comment } }),
      databaseService.tweets.countDocuments({ type: TweetType.Comment }),
      databaseService.likes.countDocuments({}),
      databaseService.bookmarks.countDocuments({}),
      databaseService.followers.countDocuments({}),
      databaseService.stories.countDocuments({}),
      databaseService.conversations.countDocuments({})
    ])

    return {
      collection_counts: {
        users: userCount,
        tweets: tweetCount,
        comments: commentCount,
        likes: likeCount,
        bookmarks: bookmarkCount,
        followers: followerCount,
        stories: storyCount,
        conversations: conversationCount
      },
      total_documents:
        userCount +
        tweetCount +
        commentCount +
        likeCount +
        bookmarkCount +
        followerCount +
        storyCount +
        conversationCount
    }
  }

  private async getMockApiUsage(interval: StatInterval, from_date?: string, to_date?: string) {
    const dateFormat = this.getDateFormatByInterval(interval)
    const fromDate = from_date ? new Date(from_date) : new Date(new Date().setDate(new Date().getDate() - 30))
    const toDate = to_date ? new Date(to_date) : new Date()

    const mockData = []
    let currentDate = new Date(fromDate)

    while (currentDate <= toDate) {
      let dateStr: string

      switch (interval) {
        case StatInterval.DAILY:
          dateStr = currentDate.toISOString().substring(0, 10) // YYYY-MM-DD
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case StatInterval.WEEKLY:
          const weekNum = Math.ceil(
            (currentDate.getDate() + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7
          )
          dateStr = `${currentDate.getFullYear()}-W${weekNum}`
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case StatInterval.MONTHLY:
        default:
          dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
      }

      mockData.push({
        date: dateStr,
        total_requests: Math.floor(Math.random() * 10000) + 5000,
        avg_response_time_ms: Math.floor(Math.random() * 200) + 100,
        endpoints: {
          tweets: Math.floor(Math.random() * 3000) + 2000,
          users: Math.floor(Math.random() * 2000) + 1000,
          auth: Math.floor(Math.random() * 1000) + 500,
          media: Math.floor(Math.random() * 1000) + 500,
          other: Math.floor(Math.random() * 500) + 200
        }
      })
    }

    return mockData
  }

  private async getMockErrorRates(interval: StatInterval, from_date?: string, to_date?: string) {
    const dateFormat = this.getDateFormatByInterval(interval)
    const fromDate = from_date ? new Date(from_date) : new Date(new Date().setDate(new Date().getDate() - 30))
    const toDate = to_date ? new Date(to_date) : new Date()

    const mockData = []
    let currentDate = new Date(fromDate)

    while (currentDate <= toDate) {
      let dateStr: string

      switch (interval) {
        case StatInterval.DAILY:
          dateStr = currentDate.toISOString().substring(0, 10) // YYYY-MM-DD
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case StatInterval.WEEKLY:
          const weekNum = Math.ceil(
            (currentDate.getDate() + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7
          )
          dateStr = `${currentDate.getFullYear()}-W${weekNum}`
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case StatInterval.MONTHLY:
        default:
          dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
      }

      const totalRequests = Math.floor(Math.random() * 10000) + 5000
      const errorCount = Math.floor(Math.random() * 200) + 50
      const errorRate = (errorCount / totalRequests) * 100

      mockData.push({
        date: dateStr,
        total_requests: totalRequests,
        error_count: errorCount,
        error_rate: errorRate.toFixed(2) + '%',
        errors_by_type: {
          '4xx': Math.floor(Math.random() * 150) + 30,
          '5xx': Math.floor(Math.random() * 50) + 20
        }
      })
    }

    return mockData
  }

  async getDashboardStatistics() {
    const userCount = await databaseService.users.countDocuments({})
    const newUsersToday = await databaseService.users.countDocuments({
      created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })

    const tweetCount = await databaseService.tweets.countDocuments({})
    const newTweetsToday = await databaseService.tweets.countDocuments({
      created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })

    const likeCount = await databaseService.likes.countDocuments({})
    const newLikesToday = await databaseService.likes.countDocuments({
      created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })

    const activeUsers = await databaseService.users.countDocuments({
      last_active: { $gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) }
    })

    const revenueTodayData = await databaseService.payments
      .aggregate([
        {
          $match: {
            created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            status: 'SUCCESS'
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: '$amount' }
          }
        }
      ])
      .toArray()

    const revenueYesterdayData = await databaseService.payments
      .aggregate([
        {
          $match: {
            created_at: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0),
              $lt: new Date(new Date().setHours(0, 0, 0, 0))
            },
            status: 'SUCCESS'
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: '$amount' }
          }
        }
      ])
      .toArray()

    const revenueToday = revenueTodayData.length > 0 ? revenueTodayData[0].amount : 0
    const revenueYesterday = revenueYesterdayData.length > 0 ? revenueYesterdayData[0].amount : 0

    const userTrend = await this.getUserGrowthByInterval(
      StatInterval.DAILY,
      new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
      new Date().toISOString()
    )

    const tweetTrend = await this.getTweetGrowthByInterval(
      StatInterval.DAILY,
      new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
      new Date().toISOString()
    )

    const subscriptionDistribution = await databaseService.users
      .aggregate([
        {
          $group: {
            _id: '$typeAccount',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const formattedSubscriptionDistribution = {
      free: 0,
      premium: 0,
      platinum: 0
    }

    subscriptionDistribution.forEach((item) => {
      if (item._id === AccountStatus.FREE) {
        formattedSubscriptionDistribution.free = item.count
      } else if (item._id === AccountStatus.PREMIUM) {
        formattedSubscriptionDistribution.premium = item.count
      } else if (item._id === AccountStatus.PLATINUM) {
        formattedSubscriptionDistribution.platinum = item.count
      }
    })

    return {
      users: {
        total: userCount,
        new_today: newUsersToday,
        active_24h: activeUsers
      },
      content: {
        total_tweets: tweetCount,
        new_tweets_today: newTweetsToday
      },
      interactions: {
        total_likes: likeCount,
        new_likes_today: newLikesToday
      },
      revenue: {
        today: revenueToday,
        yesterday: revenueYesterday,
        growth_percentage: revenueYesterday ? ((revenueToday - revenueYesterday) / revenueYesterday) * 100 : 0
      },
      trends: {
        users: userTrend,
        tweets: tweetTrend
      },
      subscription_distribution: formattedSubscriptionDistribution
    }
  }

  async getUserList(query: AdminUserListQuery) {
    const {
      page = '1',
      limit = '10',
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
      account_type,
      verification_status
    } = query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const filter: any = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ]
    }

    if (account_type) {
      filter.typeAccount = parseInt(account_type)
    }

    if (verification_status) {
      filter.verify = parseInt(verification_status)
    }

    const sortOption: any = {}
    sortOption[sort_by] = sort_order === 'asc' ? 1 : -1

    const users = await databaseService.users
      .find(filter, {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      })
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .toArray()

    const totalUsers = await databaseService.users.countDocuments(filter)

    return {
      users,
      pagination: {
        total: totalUsers,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(totalUsers / limitNum)
      }
    }
  }

  async updateUserStatus(user_id: string, status: UserVerifyStatus) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { verify: status },
        $currentDate: { updated_at: true }
      }
    )

    return { success: true }
  }

  async updateUserRole(user_id: string, role: UserRole) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { role },
        $currentDate: { updated_at: true }
      }
    )

    return { success: true }
  }

  async generateReport(
    reportType: AdminReportType,
    from_date?: string,
    to_date?: string,
    format: 'json' | 'csv' = 'json'
  ) {
    let reportData

    switch (reportType) {
      case AdminReportType.USER_GROWTH:
        reportData = await this.getUserStatistics({
          from_date,
          to_date,
          interval: StatInterval.MONTHLY
        })
        break

      case AdminReportType.CONTENT_GROWTH:
        reportData = await this.getContentStatistics({
          from_date,
          to_date,
          interval: StatInterval.MONTHLY
        })
        break

      case AdminReportType.ENGAGEMENT:
        reportData = await this.getInteractionStatistics({
          from_date,
          to_date,
          interval: StatInterval.MONTHLY
        })
        break

      case AdminReportType.REVENUE:
        reportData = await this.getRevenueStatistics({
          from_date,
          to_date,
          interval: StatInterval.MONTHLY
        })
        break

      case AdminReportType.SYSTEM_PERFORMANCE:
        reportData = await this.getSystemStatistics({
          from_date,
          to_date,
          interval: StatInterval.MONTHLY
        })
        break

      default:
        reportData = await this.getDashboardStatistics()
    }

    return {
      report_type: reportType,
      generated_at: new Date(),
      from_date: from_date ? new Date(from_date) : undefined,
      to_date: to_date ? new Date(to_date) : undefined,
      data: reportData
    }
  }
}

const adminService = new AdminService()
export default adminService
