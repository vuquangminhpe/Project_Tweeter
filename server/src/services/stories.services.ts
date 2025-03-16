import { createNewStoryResBody, viewAndStatusStoryResBody } from '~/models/request/Stories.requests'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import Stories from '~/models/schemas/Stories.schema'

class StoriesService {
  async createNewStory({ payload, user_id }: { payload: createNewStoryResBody; user_id: string }) {
    try {
      const _id = new ObjectId()
      const result = await databaseService.stories.insertOne(
        new Stories({
          ...payload,
          _id,
          user_id: new ObjectId(user_id),
          viewer: [],
          is_active: true
        })
      )
      const story = await databaseService.stories.findOne({ _id: new ObjectId(result.insertedId) })
      return story
    } catch (error) {
      console.log(error)
    }
  }

  async viewAndStatusStory({ payload, user_id }: { payload: viewAndStatusStoryResBody; user_id: string }) {
    try {
      const result = await databaseService.stories.findOneAndUpdate(
        {
          _id: new ObjectId(payload.story_id),
          user_id: new ObjectId(user_id)
        },
        {
          $push: {
            viewer: {
              viewer_id: [new ObjectId(user_id)],
              seen_at: new Date(),
              content: payload.content,
              view_status: payload.view_status
            }
          }
        },
        {
          returnDocument: 'after'
        }
      )
      return result?.viewer
    } catch (error) {
      console.log(error)
    }
  }
  async updateStory({ payload, user_id }: { payload: any; user_id: string }) {
    try {
      const result = await databaseService.stories.findOneAndUpdate(
        {
          _id: new ObjectId(payload.story_id as string),
          user_id: new ObjectId(user_id)
        },
        {
          $set: {
            ...payload
          }
        },
        {
          returnDocument: 'after'
        }
      )
      return result
    } catch (error) {
      console.log(error)
    }
  }
  async getNewsFeedStories({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    // Bước 1: Lấy danh sách người dùng kết nối
    const connectedUsersQuery = await databaseService.users
      .aggregate([
        {
          $match: {
            _id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'followers',
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      user_id: new ObjectId(user_id)
                    },
                    {
                      followed_user_id: new ObjectId(user_id)
                    }
                  ]
                }
              }
            ],
            as: 'connections'
          }
        },
        {
          $project: {
            all_users: {
              $concatArrays: [
                [new ObjectId(user_id)],
                {
                  $map: {
                    input: {
                      $filter: {
                        input: '$connections',
                        as: 'conn',
                        cond: {
                          $eq: ['$$conn.user_id', new ObjectId(user_id)]
                        }
                      }
                    },
                    as: 'follower',
                    in: '$$follower.followed_user_id'
                  }
                },
                {
                  $map: {
                    input: {
                      $filter: {
                        input: '$connections',
                        as: 'conn',
                        cond: {
                          $eq: ['$$conn.followed_user_id', new ObjectId(user_id)]
                        }
                      }
                    },
                    as: 'following',
                    in: '$$following.user_id'
                  }
                }
              ]
            }
          }
        },
        {
          $project: {
            connected_users: {
              $setUnion: ['$all_users']
            }
          }
        }
      ])
      .toArray()

    const connectedUsers = connectedUsersQuery[0]?.connected_users || [new ObjectId(user_id)]

    // Bước 2: Đếm tổng số stories để phân trang chính xác
    console.log('Connected users:', connectedUsers)

    const totalCount = await databaseService.stories.countDocuments({
      user_id: { $in: connectedUsers },
      is_active: true
    })

    console.log('Total count:', totalCount, 'Page:', page, 'Limit:', limit)

    // Đảm bảo các thông số phân trang hợp lệ
    page = Math.max(1, page)
    limit = Math.max(1, Math.min(100, limit)) // Giới hạn limit tối đa 100 để tránh quá tải

    const skip = (page - 1) * limit
    console.log('Using skip:', skip, 'limit:', limit)

    // Bước 3: Truy vấn stories với phân trang
    const stories = await databaseService.stories
      .aggregate([
        {
          $match: {
            user_id: { $in: connectedUsers },
            is_active: true
          }
        },
        {
          $sort: { created_at: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
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
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $project: {
            _id: 1,
            content: 1,
            media_url: 1,
            media_type: 1,
            caption: 1,
            created_at: 1,
            expires_at: 1,
            viewer: 1,
            privacy: 1,
            user_id: 1,
            user: 1
          }
        }
      ])
      .toArray()

    console.log('Stories found:', stories.length)

    return {
      result: stories,
      total: totalCount,
      page,
      limit,
      skip,
      totalPages: Math.ceil(totalCount / limit)
    }
  }
  async getArchiveStories({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const result = await databaseService.stories
      .aggregate([
        {
          $match: {
            user_id: new ObjectId(user_id),
            is_active: false
          }
        },
        {
          $sort: {
            created_at: -1
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: page
        }
      ])
      .toArray()
    return { result, total: result.length }
  }
  async deleteStory({ user_id, story_id }: { user_id: string; story_id: string }) {
    const result = await databaseService.stories.deleteOne({
      _id: new ObjectId(story_id),
      user_id: new ObjectId(user_id)
    })
    return result
  }
  async getStoryViewers({ user_id, story_id }: { user_id: string; story_id: string }) {
    const result = await databaseService.stories.findOne({
      user_id: new ObjectId(user_id),
      _id: new ObjectId(story_id)
    })
    return result?.viewer
  }
  async reactStory({ user_id, story_id, reaction_type }: { user_id: string; story_id: string; reaction_type: string }) {
    const result = await databaseService.stories.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        _id: new ObjectId(story_id)
      },
      {
        $push: {
          reactions: {
            user_id: new ObjectId(user_id),
            reaction_type
          }
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return result
  }
  async replyStory({ user_id, story_id, payload }: { user_id: string; story_id: string; payload: any }) {
    const result = await databaseService.stories.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        _id: new ObjectId(story_id)
      },
      {
        $push: {
          replies: {
            user_id: new ObjectId(user_id),
            ...payload
          }
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return result
  }

  async hideUserStories({ user_id, target_user_id }: { user_id: string; target_user_id: string }) {
    const result = await databaseService.stories.updateMany(
      {
        user_id: new ObjectId(user_id),
        viewer: {
          $elemMatch: {
            viewer_id: new ObjectId(target_user_id)
          }
        }
      },
      {
        $set: {
          'viewer.$.view_status': 'hidden'
        }
      }
    )
    return result
  }
}

const storiesService = new StoriesService()
export default storiesService
