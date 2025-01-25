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
  async getAllConversations(user_id: string) {
    const allConversations = await databaseService.users
      .aggregate([
        {
          $match: {
            _id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'followers',
            localField: '_id',
            foreignField: 'user_id',
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
            'users_follower_info.name': 1,
            'users_follower_info.username': 1,
            'users_follower_info.avatar': 1,
            'users_follower_info.cover_photo': 1
          }
        },
        {
          $limit: 20
        },
        {
          $skip: 10
        }
      ])
      .toArray()
    return allConversations
  }
}
const conversationServices = new ConversationService()
export default conversationServices
