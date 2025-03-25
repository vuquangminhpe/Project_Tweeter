import { PostDataAI } from '@/types/Ai.types'
import { createdTweet, Tweets } from '@/types/Tweet.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'
const tweetsApi = {
  getAllTweets: () => http.get<SuccessResponse<Tweets[]>>('/tweets'),
  deleteTweet: (tweet_id: string) => http.delete<SuccessResponse<string>>(`/tweets/${tweet_id}`),
  createTweet: (body: createdTweet) => http.post<SuccessResponse<Tweets>>('/tweets', body),
  updateTweets: (body: createdTweet) => http.put<SuccessResponse<Tweets>>(`/tweets/edit`, body),
  getTweetDetailsGuest: (tweet_id: string) => http.get<SuccessResponse<Tweets>>(`/tweets/guest/${tweet_id}`),
  getNewFeeds: (page: number, limit: number) =>
    http.get<SuccessResponse<Tweets[]>>(`/tweets/new/new-feeds`, {
      params: {
        page,
        limit
      }
    }),
  generateTweetWithAi: (message: string) =>
    http.post<SuccessResponse<PostDataAI>>(`/geminiTweet/generate/text`, { message }),
  chatWithAi: (message: string) => http.post<SuccessResponse<string>>(`/tweets/generate/chat`, message)
}
export default tweetsApi
