import { ConversationResponse } from '@/types/Conversation.type'
import { getFollowersResponse } from '@/types/User.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const conversationsApi = {
  getChatWithFriend: (receiver: string, limit: number, page: number) =>
    http.get<ConversationResponse>(`conversations/receivers/${receiver}`, {
      params: {
        limit: limit,
        page: page
      }
    }),
  getAllConversationsWithFollower: (limit: number, page: number) =>
    http.get<SuccessResponse<getFollowersResponse[]>>(`conversations/all_conversation?limit=${limit}&page=${page}`),
  editMessageInConversation: (message_id: string | number, content: string) =>
    http.put<SuccessResponse<{ message: string }>>(`conversations/message/${message_id}`, { content }),
  setEmojiMessageInConversation: (message_id: string | number, emoji: string) =>
    http.post<SuccessResponse<{ message: string }>>(`conversations/message/emoji/${message_id}`, { emoji }),
  deleteMessageInConversation: (message_id: string | number) =>
    http.delete<SuccessResponse<{ message: string }>>(`conversations/message/${message_id}`)
}
export default conversationsApi
