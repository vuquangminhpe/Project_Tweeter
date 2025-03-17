import http from '@/utils/http'

const apiAIGEN = {
  chatBotAiGen: (message: string) => http.post('/generate/chat', message),
  getConversationAI: () => http.get('/conversation/chat')
}
export default apiAIGEN
