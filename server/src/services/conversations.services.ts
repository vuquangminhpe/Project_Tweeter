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
}
const conversationServices = new ConversationService()
export default conversationServices
