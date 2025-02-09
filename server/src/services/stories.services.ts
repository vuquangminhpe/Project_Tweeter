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
    const result = await databaseService.users
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
        },
        {
          $lookup: {
            from: 'stories',
            let: {
              user_ids: '$connected_users'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $in: ['$user_id', '$$user_ids']
                      },
                      {
                        $eq: ['$is_active', true]
                      }
                    ]
                  }
                }
              },
              {
                $sort: {
                  created_at: -1
                }
              }
            ],
            as: 'stories'
          }
        },
        {
          $unwind: {
            path: '$stories',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'stories.user_id',
            foreignField: '_id',
            as: 'stories.user'
          }
        },
        {
          $unwind: {
            path: '$stories.user',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $group: {
            _id: null,
            stories: {
              $push: {
                _id: '$stories._id',
                content: '$stories.content',
                media_url: '$stories.media_url',
                media_type: '$stories.media_type',
                caption: '$stories.caption',
                created_at: '$stories.created_at',
                expires_at: '$stories.expires_at',
                viewer: '$stories.viewer',
                privacy: '$stories.privacy',
                user_id: '$stories.user_id',
                user: '$stories.user'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            stories: 1
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

    return { result: result[0]?.stories || [], total: result[0]?.stories.length || 0 }
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
}

const storiesService = new StoriesService()
export default storiesService
