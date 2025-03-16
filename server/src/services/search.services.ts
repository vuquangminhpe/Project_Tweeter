import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { MediaType, MediaTypeQuery, TweetType } from '~/constants/enums'
import { performance } from 'perf_hooks'
import NodeCache from 'node-cache'

class SearchService {
  private cache: NodeCache
  private MAX_PAGE_SIZE = 100
  private CACHE_TTL_SECONDS = 300

  constructor() {
    this.cache = new NodeCache({
      stdTTL: this.CACHE_TTL_SECONDS,
      checkperiod: 120,
      useClones: false
    })
  }

  async search({
    limit,
    page,
    content,
    user_id,
    media_type,
    people_follow
  }: {
    media_type: MediaTypeQuery
    user_id?: string
    content: string
    limit: number
    page: number
    people_follow?: boolean
  }) {
    const startTime = performance.now()

    const safeLimit = Math.min(limit || 10, this.MAX_PAGE_SIZE)
    const safePage = Math.max(page || 1, 1)

    const cacheKey = this.generateCacheKey({
      content,
      user_id,
      media_type,
      people_follow,
      page: safePage,
      limit: safeLimit
    })

    const cachedResult = this.cache.get(cacheKey)
    if (cachedResult) {
      console.log(`Search cache hit: ${cacheKey}`)

      const result = cachedResult as any
      if (result.tweets?.length > 0) {
        this.incrementViewCountsAsync(result.tweets, user_id)
      }

      return result
    }

    const $match: any = {}
    let useTextScore = false
    let hintObj: Record<string, any> | null = null

    if (content && content.trim()) {
      const trimmedContent = content.trim()

      const hasTextIndex = await this.hasTextIndex()

      if (hasTextIndex) {
        $match['$text'] = { $search: trimmedContent }
        useTextScore = true
        hintObj = { content: 'text' }
      } else {
        const terms = trimmedContent.split(/\s+/).filter((t) => t.length > 0)
        if (terms.length > 1) {
          $match['$and'] = terms.map((term) => ({
            content: { $regex: term, $options: 'i' }
          }))
        } else {
          $match['content'] = { $regex: trimmedContent, $options: 'i' }
        }
      }
    }

    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        $match['medias.type'] = MediaType.Image
        if (!hintObj) hintObj = { 'medias.type': 1 }
      } else if (media_type === MediaTypeQuery.Video) {
        $match['medias.type'] = { $in: [MediaType.Video, MediaType.HLS] }
        if (!hintObj) hintObj = { 'medias.type': 1 }
      }
    }

    const followedUserIds: ObjectId[] = []
    if (people_follow && user_id) {
      const followCacheKey = `followed:${user_id}`
      let cachedIds = this.cache.get(followCacheKey) as string[] | undefined

      if (cachedIds) {
        followedUserIds.push(...cachedIds.map((id) => new ObjectId(id)))
      } else {
        const user_id_obj = new ObjectId(user_id)
        const followed = await databaseService.followers
          .find({ user_id: user_id_obj }, { projection: { followed_user_id: 1, _id: 0 } })
          .toArray()

        followed.forEach((item) => followedUserIds.push(item.followed_user_id))

        this.cache.set(
          followCacheKey,
          followedUserIds.map((id) => id.toString()),
          3600
        )
      }

      if (user_id) {
        followedUserIds.push(new ObjectId(user_id))
      }

      $match['user_id'] = { $in: followedUserIds }

      if (!hintObj) hintObj = { user_id: 1 }
    }

    const audienceCondition = user_id
      ? {
          $or: [
            { audience: 0 },
            {
              $and: [{ audience: 1 }, { 'user.twitter_circle': { $in: [new ObjectId(user_id)] } }]
            }
          ]
        }
      : { audience: 0 }

    const skip = safeLimit * (safePage - 1)

    const sortStage = useTextScore ? { $sort: { score: { $meta: 'textScore' } } } : { $sort: { created_at: -1 } }

    const pipeline = [
      { $match },
      sortStage,
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                username: 1,
                avatar: 1,
                twitter_circle: user_id ? 1 : 0
              }
            }
          ]
        }
      },
      { $unwind: { path: '$user' } },
      { $match: audienceCondition },
      {
        $lookup: {
          from: 'hashtags',
          localField: 'hashtags',
          foreignField: '_id',
          as: 'hashtags',
          pipeline: [{ $project: { _id: 1, name: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'mentions',
          foreignField: '_id',
          as: 'mentions',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                username: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'bookmarks',
          let: { tweet_id: '$_id' },
          pipeline: [{ $match: { $expr: { $eq: ['$tweet_id', '$$tweet_id'] } } }, { $count: 'total' }],
          as: 'bookmark_count'
        }
      },
      {
        $lookup: {
          from: 'likes',
          let: { tweet_id: '$_id' },
          pipeline: [{ $match: { $expr: { $eq: ['$tweet_id', '$$tweet_id'] } } }, { $count: 'total' }],
          as: 'like_count'
        }
      },
      {
        $lookup: {
          from: 'tweets',
          let: { tweet_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$parent_id', '$$tweet_id'] }
              }
            },
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 }
              }
            }
          ],
          as: 'tweet_stats'
        }
      },
      {
        $addFields: {
          bookmarks: { $ifNull: [{ $arrayElemAt: ['$bookmark_count.total', 0] }, 0] },
          likes: { $ifNull: [{ $arrayElemAt: ['$like_count.total', 0] }, 0] },
          retweet_count: {
            $reduce: {
              input: {
                $filter: {
                  input: '$tweet_stats',
                  as: 'stat',
                  cond: { $eq: ['$$stat._id', TweetType.Retweet] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.count'] }
            }
          },
          comment_count: {
            $reduce: {
              input: {
                $filter: {
                  input: '$tweet_stats',
                  as: 'stat',
                  cond: { $eq: ['$$stat._id', TweetType.Comment] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.count'] }
            }
          },
          quote_count: {
            $reduce: {
              input: {
                $filter: {
                  input: '$tweet_stats',
                  as: 'stat',
                  cond: { $eq: ['$$stat._id', TweetType.QuoteTweet] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.count'] }
            }
          }
        }
      },
      {
        $project: {
          bookmark_count: 0,
          like_count: 0,
          tweet_stats: 0
        }
      },
      { $skip: skip },
      { $limit: safeLimit }
    ]

    try {
      const aggregateOptions = hintObj ? { hint: hintObj } : undefined

      const [tweets, total] = await Promise.all([
        databaseService.tweets.aggregate(pipeline, aggregateOptions).toArray(),
        this.getTotalCount({ content, user_id, media_type, people_follow })
      ])

      if (tweets.length > 0) {
        this.incrementViewCountsAsync(tweets, user_id)
      }

      const result = {
        tweets,
        total_pages: Math.ceil(total / safeLimit) || 0,
        total_tweets: total,
        limit: safeLimit,
        page: safePage,
        execution_time_ms: Math.round(performance.now() - startTime)
      }

      if (tweets.length > 0 && safePage <= 10) {
        this.cache.set(cacheKey, result)
      }

      return result
    } catch (error) {
      console.error('Search error:', error)
      throw error
    }
  }

  private async getTotalCount({
    content,
    user_id,
    media_type,
    people_follow
  }: {
    content: string
    user_id?: string
    media_type: MediaTypeQuery
    people_follow?: boolean
  }): Promise<number> {
    const countCacheKey = `count:${this.generateCacheKey({
      content,
      user_id,
      media_type,
      people_follow,
      page: 1,
      limit: 1
    })}`

    const cachedCount = this.cache.get(countCacheKey)
    if (cachedCount !== undefined) {
      return cachedCount as number
    }

    const $match: any = {}
    let hintObj: Record<string, any> | null = null

    if (content && content.trim()) {
      const trimmedContent = content.trim()
      const hasTextIndex = await this.hasTextIndex()

      if (hasTextIndex) {
        $match['$text'] = { $search: trimmedContent }
        hintObj = { content: 'text' }
      } else {
        const terms = trimmedContent.split(/\s+/).filter((t) => t.length > 0)
        if (terms.length > 1) {
          $match['$and'] = terms.map((term) => ({
            content: { $regex: term, $options: 'i' }
          }))
        } else {
          $match['content'] = { $regex: trimmedContent, $options: 'i' }
        }
      }
    }

    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        $match['medias.type'] = MediaType.Image
        if (!hintObj) hintObj = { 'medias.type': 1 }
      } else if (media_type === MediaTypeQuery.Video) {
        $match['medias.type'] = { $in: [MediaType.Video, MediaType.HLS] }
        if (!hintObj) hintObj = { 'medias.type': 1 }
      }
    }

    if (people_follow && user_id) {
      const followCacheKey = `followed:${user_id}`
      let followedUserIds: ObjectId[] = []

      const cachedIds = this.cache.get(followCacheKey) as string[] | undefined
      if (cachedIds) {
        followedUserIds = cachedIds.map((id) => new ObjectId(id))
      } else {
        const user_id_obj = new ObjectId(user_id)
        const followed = await databaseService.followers
          .find({ user_id: user_id_obj }, { projection: { followed_user_id: 1, _id: 0 } })
          .toArray()

        followedUserIds = followed.map((item) => item.followed_user_id)
        this.cache.set(
          followCacheKey,
          followedUserIds.map((id) => id.toString()),
          3600
        )
      }

      followedUserIds.push(new ObjectId(user_id))
      $match['user_id'] = { $in: followedUserIds }

      if (!hintObj) hintObj = { user_id: 1 }
    }

    const audienceCondition = user_id
      ? {
          $or: [
            { audience: 0 },
            {
              $and: [{ audience: 1 }, { 'user.twitter_circle': { $in: [new ObjectId(user_id)] } }]
            }
          ]
        }
      : { audience: 0 }

    const countPipeline = [
      { $match },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                _id: 1,
                twitter_circle: user_id ? 1 : 0
              }
            }
          ]
        }
      },
      { $unwind: { path: '$user' } },
      { $match: audienceCondition },
      { $count: 'total' }
    ]

    const aggregateOptions = hintObj ? { hint: hintObj } : undefined
    const countResult = await databaseService.tweets.aggregate(countPipeline, aggregateOptions).toArray()
    const count = countResult[0]?.total || 0

    this.cache.set(countCacheKey, count, this.CACHE_TTL_SECONDS)

    return count
  }

  private incrementViewCountsAsync(tweets: any[], user_id?: string) {
    const tweet_ids = tweets.map((tweet) => tweet._id)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()

    databaseService.tweets
      .updateMany(
        { _id: { $in: tweet_ids } },
        {
          $inc: inc,
          $set: { updated_at: date }
        }
      )
      .catch((err) => console.error('Error updating view counts:', err))

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views = (tweet.user_views || 0) + 1
      } else {
        tweet.guest_views = (tweet.guest_views || 0) + 1
      }
    })
  }

  private async hasTextIndex(): Promise<boolean> {
    const indexCacheKey = 'tweets:textindex:exists'

    const cachedResult = this.cache.get(indexCacheKey)
    if (cachedResult !== undefined) {
      return cachedResult as boolean
    }

    try {
      const indexes = await databaseService.tweets.indexes()
      const hasIndex = indexes.some(
        (index) => index.key && Object.keys(index.key).some((key) => key === 'content' && index.textIndexVersion)
      )

      this.cache.set(indexCacheKey, hasIndex, 86400)

      return hasIndex
    } catch (error) {
      console.error('Error checking text index:', error)
      return false
    }
  }

  async createSearchIndexes() {
    try {
      console.log('Creating search indexes...')

      await databaseService.tweets.createIndex(
        { content: 'text', name: 'text' },
        {
          weights: {
            content: 10,
            name: 5
          },
          default_language: 'none',
          language_override: 'language'
        }
      )

      await databaseService.tweets.createIndex({ 'medias.type': 1, created_at: -1 })
      await databaseService.tweets.createIndex({ user_id: 1, created_at: -1 })
      await databaseService.tweets.createIndex({ parent_id: 1, type: 1 })
      await databaseService.tweets.createIndex({ audience: 1 })
      await databaseService.tweets.createIndex({ created_at: -1 })

      await databaseService.likes.createIndex({ tweet_id: 1, user_id: 1 }, { unique: true })
      await databaseService.bookmarks.createIndex({ tweet_id: 1, user_id: 1 }, { unique: true })
      await databaseService.followers.createIndex({ user_id: 1, followed_user_id: 1 }, { unique: true })

      console.log('All search indexes created successfully')

      this.cache.del('tweets:textindex:exists')
    } catch (error) {
      console.error('Error creating indexes:', error)
      throw error
    }
  }

  private generateCacheKey(params: any): string {
    const { content, user_id, media_type, people_follow, page, limit } = params
    return `search:${content || ''}:${user_id || 'guest'}:${media_type || 'all'}:${people_follow ? 1 : 0}:${page}:${limit}`
  }

  clearCache(pattern?: string) {
    if (pattern) {
      const keys = this.cache.keys().filter((key) => key.includes(pattern))
      if (keys.length > 0) {
        this.cache.del(keys)
        console.log(`Cleared ${keys.length} cache entries with pattern: ${pattern}`)
      }
    } else {
      this.cache.flushAll()
      console.log('Cleared all cache entries')
    }
  }
}

const searchService = new SearchService()
export default searchService
