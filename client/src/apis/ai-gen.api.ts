import { dataParams, ResponseAI } from '@/types/Ai.types'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const apiAIGEN = {
  chatBotAiGen: (message: string) =>
    http.post<SuccessResponse<{ content: string }>>('/geminiTweet/generate/chat', { message }),
  getConversationAI: (params: dataParams) =>
    http.get<SuccessResponse<ResponseAI[]>>('/geminiTweet/conversation/chat', {
      params
    })
}
export default apiAIGEN
