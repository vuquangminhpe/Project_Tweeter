import { ResponseAI } from '@/types/Ai.types'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const apiAIGEN = {
  chatBotAiGen: (message: string) => http.post<SuccessResponse<{ message: string }>>('/generate/chat', message),
  getConversationAI: () => http.get<SuccessResponse<ResponseAI>>('/conversation/chat')
}
export default apiAIGEN
