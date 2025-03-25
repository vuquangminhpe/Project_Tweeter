import { EditTweetRequestBody, TweetRequestBody } from '~/models/request/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { AccountStatus, MediaType, TweetAudience, TweetType } from '~/constants/enums'
import { deleteFileFromS3, deleteS3Folder } from '~/utils/s3'
import { convertS3Url, extractContentAndInsertToDB, extractGeminiData } from '~/utils/utils'
import { GoogleGenerativeAI } from '@google/generative-ai'

import * as nodeFetch from 'node-fetch'
import { config } from 'dotenv'
import { PROMPT_CHAT, PROMPT_TWEET_FREE, PROMPT_TWEET_PREMIUM } from '~/constants/prompt'

config()
if (!globalThis.fetch) {
  ;(globalThis as any).fetch = nodeFetch.default
  ;(globalThis as any).Headers = nodeFetch.Headers
  ;(globalThis as any).Request = nodeFetch.Request
  ;(globalThis as any).Response = nodeFetch.Response
}
class TweetService {
  async checkAndCreateHashtag(hashtags: string[]) {
    console.log('hashtags', hashtags)

    const hashtagDocuments = await Promise.all(
      hashtags.map(async (hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )

    return hashtagDocuments.map((hashtag) => hashtag?._id as ObjectId)
  }
  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)
    const results = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        guest_views: 0,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )

    const tweet = await databaseService.tweets.findOne({ _id: results.insertedId })
    return tweet
  }
  async getTweet(user_id: string) {
    const allTweet = await databaseService.tweets
      .aggregate([
        {
          $match: { user_id: new ObjectId(user_id) }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mention_info'
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtag_info'
          }
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            content: 1,
            medias: 1,
            mentions: 1,
            hashtags: 1,
            created_at: 1,
            updated_at: 1,
            guest_views: 1,
            user_views: 1,
            audience: 1,
            'mention_info.username': 1,
            'hashtag_info.name': 1
          }
        }
      ])
      .toArray()

    return allTweet
  }
  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const results = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )
    return results as unknown as WithId<{
      guest_views: number
      user_views: number
      update_at: Date
    }>
  }
  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  email: '$$mention.email',
                  username: '$$mention.username',
                  date_of_birth: '$$mention.date_of_birth'
                }
              }
            }
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
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: limit * (page - 1) // CT Phân trang
        },
        {
          $limit: page
        }
      ])
      .toArray()
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })
    return { tweets, total }
  }

  async getNewFeeds({ limit, page, user_id }: { limit: number; page: number; user_id?: string }) {
    const user_id_obj = new ObjectId(user_id)
    const followed_user_ids = await databaseService.followers
      .find(
        {
          user_id: user_id_obj
        },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()
    const ids = followed_user_ids.map((item) => item.followed_user_id)
    ids.push(user_id_obj)

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
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
          {
            $unwind: '$user'
          },
          {
            $match: {
              $or: [
                { audience: 0 },
                {
                  $and: [
                    { audience: 1 },
                    {
                      'user.twitter_circle': {
                        $in: [new ObjectId(user_id_obj)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mention_info'
            }
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtag_info'
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $project: {
              _id: 1,
              user_id: 1,
              content: 1,
              medias: 1,
              mentions: 1,
              hashtags: 1,
              created_at: 1,
              updated_at: 1,
              guest_views: 1,
              user_views: 1,
              audience: 1,
              'mention_info.username': 1,
              'hashtag_info.name': 1
            }
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: { $in: ids }
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
          {
            $unwind: '$user'
          },
          {
            $match: {
              $or: [
                { audience: 0 },
                {
                  $and: [
                    { audience: 1 },
                    {
                      'user.twitter_circle': {
                        $in: [new ObjectId(user_id_obj)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: inc,
        $set: {
          updated_at: date
        }
      }
    )

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })

    return { tweets, total: total[0].total }
  }
  async editTweet(user_id: string, body: EditTweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)
    const results = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(body._id as string),
        user_id: new ObjectId(user_id)
      },
      {
        $set: {
          content: body.content,
          medias: body.medias,
          hashtags: hashtags,
          mentions: body.mentions.map((mention) => new ObjectId(mention)),
          audience: body.audience
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    results?.hashtags.map(
      async (hashtag) =>
        await databaseService.hashtags.updateOne(
          {
            _id: (hashtag as any)._id
          },
          {
            $set: {
              name: (hashtag as any).name
            },
            $currentDate: {
              created_at: true
            }
          }
        )
    )

    return results
  }
  async deleteTweet(user_id: string, tweet_id: string) {
    const [results] = await Promise.all([
      databaseService.tweets.findOne({
        _id: new ObjectId(tweet_id),
        user_id: new ObjectId(user_id)
      }),
      databaseService.tweets.deleteOne({
        _id: new ObjectId(tweet_id),
        user_id: new ObjectId(user_id)
      }),
      databaseService.likes.deleteMany({
        tweet_id: new ObjectId(tweet_id)
      }),
      databaseService.bookmarks.deleteMany({
        tweet_id: new ObjectId(tweet_id)
      }),
      databaseService.comments.deleteMany({
        tweet_id: new ObjectId(tweet_id)
      })
    ])
    if (results) {
      await Promise.all(
        results.medias.map(async (media) => {
          if (media.type === MediaType.Image) {
            console.log(media.url)

            return await deleteFileFromS3(media.url)
          } else if (media.type === MediaType.HLS) {
            console.log(convertS3Url(media.url).split('/master.m3u8')[0])

            return await deleteS3Folder(convertS3Url(media.url).split('/master.m3u8')[0])
          }
        })
      )
      return results
    }
  }
  async generateTweetWithTextGemini(user_id: string, message: string) {
    const apiKey = process.env.GERMINI_API_KEY
    const genAI = new GoogleGenerativeAI(apiKey as string)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    console.log(user?.typeAccount)

    if (user?.typeAccount === AccountStatus.FREE && user.count_type_account < 5) {
      const result =
        user.count_type_account < 2
          ? await model.generateContent([PROMPT_TWEET_PREMIUM, message])
          : await model.generateContent([PROMPT_TWEET_FREE, message])
      const response = await result.response
      const aiResponseText = response.text()

      const parsedResponse = extractGeminiData(aiResponseText)
      await databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $inc: {
            count_type_account: 1
          }
        }
      )
      console.log(parsedResponse)

      return parsedResponse
    } else if (user?.typeAccount === AccountStatus.PREMIUM && user.count_type_account < 20) {
      const result =
        user.count_type_account < 15
          ? await model.generateContent([PROMPT_TWEET_PREMIUM, message])
          : await model.generateContent([PROMPT_TWEET_FREE, message])
      const response = await result.response
      const aiResponseText = response.text()

      const parsedResponse = extractGeminiData(aiResponseText)
      await databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $inc: {
            count_type_account: 1
          }
        }
      )
      console.log(parsedResponse)

      return parsedResponse
    } else if (user?.typeAccount === AccountStatus.PLATINUM) {
      const result = await model.generateContent([PROMPT_TWEET_PREMIUM, message])
      const response = await result.response
      const aiResponseText = response.text()

      const parsedResponse = extractGeminiData(aiResponseText)
      await databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $inc: {
            count_type_account: 1
          }
        }
      )
      console.log(parsedResponse)

      return parsedResponse
    }
  }
  async chatWithGemini(user_id: string, message: string) {
    const apiKey = process.env.GERMINI_API_KEY
    const genAI = new GoogleGenerativeAI(apiKey as string)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent([PROMPT_CHAT, message])

    const response = await result.response
    const aiResponseText = response.text()

    return await extractContentAndInsertToDB(user_id, aiResponseText, message)
  }
  async getConversationInAI(user_id: string, page: number = 1, limit: number = 10) {
    const sender_id_gemini = new ObjectId('60f3b3b3b3b3b3b3b3b3b3b3')
    const skip = (page - 1) * limit

    const total = await databaseService.conversations.countDocuments({
      $or: [
        {
          receive_id: new ObjectId(user_id),
          sender_id: sender_id_gemini
        },
        {
          receive_id: sender_id_gemini,
          sender_id: new ObjectId(user_id)
        }
      ]
    })

    const conversations = await databaseService.conversations
      .aggregate([
        {
          $match: {
            $or: [
              {
                receive_id: new ObjectId(user_id),
                sender_id: sender_id_gemini
              },
              {
                receive_id: sender_id_gemini,
                sender_id: new ObjectId(user_id)
              }
            ]
          }
        },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            sender_id: 1,
            receive_id: 1,
            content: 1,
            created_at: 1,
            'sender_info.username': 1
          }
        }
      ])
      .toArray()

    return {
      conversations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}
const tweetsService = new TweetService()
export default tweetsService
