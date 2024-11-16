import { ObjectId } from 'bson'
import databaseService from './database.services'

class ConversationService {
  async getConversations({ sender_id, receiver_id }: { sender_id: string; receiver_id: string }) {
    const conversations = await databaseService.conversations
      .find({
        sender_id: new ObjectId(sender_id),
        receive_id: new ObjectId(receiver_id)
      })
      .toArray()
    return conversations
  }
}
const conversationServices = new ConversationService()
export default conversationServices
