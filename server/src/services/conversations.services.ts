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
        { sender_id: new ObjectId(sender_id), receive_id: new ObjectId(receiver_id) },
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
  async getAllConversations({ user_id, page, limit }: { user_id: string; page: number; limit: number }) {
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
            $project: {
              _id: 0,
              'users_follower_info._id': 1,
              'users_follower_info.name': 1,
              'users_follower_info.username': 1,
              'users_follower_info.avatar': 1,
              'users_follower_info.cover_photo': 1,
              'users_follower_info.is_online': 1,
              'users_follower_info.last_active': 1
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
              localField: 'followers_info.followed_user_id',
              foreignField: '_id',
              as: 'users_follower_info'
            }
          },
          {
            $unwind: {
              path: '$users_follower_info'
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
              'users_follower_info.last_active': 1
            }
          }
        ])
        .toArray()
    ])
    return { allConversations, total: total.length }
  }
  async editConversation({ message_id, user_id, content }: { message_id: string; user_id: string; content: string }) {
    const result = await databaseService.conversations.findOneAndUpdate(
      {
        _id: new ObjectId(message_id),
        sender_id: new ObjectId(user_id)
      },
      {
        $set: {
          content
        },
        $currentDate: { update_at: true }
      },
      { returnDocument: 'after' }
    )
    return result
  }
  async deleteMessageInConversation({ messages_id }: { messages_id: string }) {
    const result = await databaseService.conversations.deleteOne({
      _id: new ObjectId(messages_id)
    })
    return result
  }
}
const conversationServices = new ConversationService()
export default conversationServices
