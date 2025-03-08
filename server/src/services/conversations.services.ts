import { ObjectId } from 'mongodb'
import databaseService from './database.services'

class ConversationService {
  async getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) {
    const match = {
      $or: [
        { sender_id: new ObjectId(sender_id), 
          receive_id: new ObjectId(receiver_id) },
        {
          sender_id: new ObjectId(receiver_id),
          receive_id: new ObjectId(sender_id)
        }
      ]
    }
    const conversations = await databaseService.conversations
      .find(match)
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    const total = await databaseService.conversations.countDocuments(match)
    return { conversations, total: total || 0 }
  }
  async getAllConversations({
    user_id,
    page,
    limit,
    search
  }: {
    user_id: string
    page: number
    limit: number
    search: string
  }) {
    const [allConversations, total] = await Promise.all([
      databaseService.users
        .aggregate([
          {
            $match: {
              _id: new ObjectId(user_id)
            }
          },
          {
            $lookup: {
              from: 'followers',
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [{ $eq: ['$user_id', '$$userId'] }, { $eq: ['$followed_user_id', '$$userId'] }]
                    }
                  }
                },
                {
                  $addFields: {
                    isFollowing: { $eq: ['$user_id', '$$userId'] }
                  }
                }
              ],
              as: 'followers_info'
            }
          },
          {
            $unwind: {
              path: '$followers_info'
            }
          },
          {
            $lookup: {
              from: 'users',
              let: {
                lookupId: {
                  $cond: {
                    if: '$followers_info.isFollowing',
                    then: '$followers_info.followed_user_id',
                    else: '$followers_info.user_id'
                  }
                }
              },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$lookupId'] }
                  }
                }
              ],
              as: 'users_follower_info'
            }
          },
          {
            $unwind: {
              path: '$users_follower_info'
            }
          },
          {
            $match: {
              $expr: {
                $cond: {
                  if: { $ne: [search, ''] },
                  then: {
                    $regexMatch: {
                      input: '$users_follower_info.name',
                      regex: new RegExp(search, 'i')
                    }
                  },
                  else: true
                }
              }
            }
          },
          {
            $lookup: {
              from: 'conversations',
              let: {
                userId: '$_id',
                otherUserId: '$users_follower_info._id'
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        {
                          $and: [{ $eq: ['$sender_id', '$$userId'] }, { $eq: ['$receive_id', '$$otherUserId'] }]
                        },
                        {
                          $and: [{ $eq: ['$sender_id', '$$otherUserId'] }, { $eq: ['$receive_id', '$$userId'] }]
                        }
                      ]
                    }
                  }
                }
              ],
              as: 'conversations'
            }
          },
          {
            $addFields: {
              messageCount: { $size: '$conversations' },
              lastMessage: {
                $max: {
                  $map: {
                    input: '$conversations',
                    as: 'conversation',
                    in: '$$conversation.created_at'
                  }
                }
              }
            }
          },
          {
            $sort: {
              messageCount: -1,
              lastMessage: -1
            }
          },
          {
            $project: {
              _id: 0,
              'users_follower_info._id': 1,
              'users_follower_info.name': 1,
              'users_follower_info.username': 1,
              'users_follower_info.avatar': 1,
              'users_follower_info.cover_photo': 1,
              'users_follower_info.is_online': 1,
              'users_follower_info.last_active': 1,
              messageCount: 1,
              lastMessage: 1
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.users
        .aggregate([
          {
            $match: {
              _id: new ObjectId(user_id)
            }
          },
          {
            $lookup: {
              from: 'followers',
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [{ $eq: ['$user_id', '$$userId'] }, { $eq: ['$followed_user_id', '$$userId'] }]
                    }
                  }
                },
                {
                  $addFields: {
                    isFollowing: { $eq: ['$user_id', '$$userId'] }
                  }
                }
              ],
              as: 'followers_info'
            }
          },
          {
            $unwind: {
              path: '$followers_info'
            }
          },
          {
            $lookup: {
              from: 'users',
              let: {
                lookupId: {
                  $cond: {
                    if: '$followers_info.isFollowing',
                    then: '$followers_info.followed_user_id',
                    else: '$followers_info.user_id'
                  }
                }
              },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$lookupId'] }
                  }
                }
              ],
              as: 'users_follower_info'
            }
          },
          {
            $unwind: {
              path: '$users_follower_info'
            }
          },
          {
            $match: {
              $expr: {
                $cond: {
                  if: { $ne: [search, ''] },
                  then: {
                    $regexMatch: {
                      input: '$users_follower_info.name',
                      regex: new RegExp(search, 'i')
                    }
                  },
                  else: true
                }
              }
            }
          }
        ])
        .toArray()
    ])
    return { allConversations, total: total.length }
  }
  async editConversation({ messages_id, content }: { messages_id: string; content: string }) {
    const result = await databaseService.conversations.findOneAndUpdate(
      {
        _id: new ObjectId(messages_id)
      },
      {
        $set: {
          content
        },
        $currentDate: { updated_at: true }
      }
    )
    return result
  }
  async deleteMessageInConversation({ messages_id }: { messages_id: string }) {
    const result = await databaseService.conversations.deleteOne({
      _id: new ObjectId(messages_id)
    })
    return result
  }
  async setEmojiMessageInConversation({ messages_id, emoji }: { messages_id: string; emoji: number }) {
    const result = await databaseService.conversations.findOneAndUpdate(
      {
        _id: new ObjectId(messages_id)
      },
      {
        $set: {
          emoji
        },
        $currentDate: { updated_at: true }
      }
    )
    return result
  }
  async deleteAllMessageInConversation({ sender_id, receiver_id }: { sender_id: string; receiver_id: string }) {
    const match = {
      $or: [
        { sender_id: new ObjectId(sender_id), receive_id: new ObjectId(receiver_id) },
        { sender_id: new ObjectId(receiver_id), receive_id: new ObjectId(sender_id) }
      ]
    }

    const result = await databaseService.conversations.deleteMany(match)

    return {
      success: result.acknowledged
    }
  }
}
const conversationServices = new ConversationService()
export default conversationServices
