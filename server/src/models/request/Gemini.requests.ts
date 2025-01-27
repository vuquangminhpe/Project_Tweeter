export interface GeminiResponse {
  content: string
  hashtags: string[]
  scheduled_time: string
  sentiment_analysis: Gemini_Sentiment_Analysis
  analytics_tags: Gemini_Analytics_Tags
}

interface Gemini_Sentiment_Analysis {
  sentiment: string
  confidence_score: number
}
interface Gemini_Analytics_Tags {
  campaign: string
  source: string
  target_audience: string
}
export interface GeminiSuccessResponse {
  status: 'SUCCESS'
  data: GeminiResponse
}

export interface GeminiViolationResponse {
  status: 'VIOLATION'
  message: string
}
