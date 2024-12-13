import { createdTweet, Tweets } from '@/types/Tweet.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'
const tweetsApi = {
  getAllTweets: () => http.get<SuccessResponse<Tweets[]>>('/tweets'),
  deleteTweet: (tweet_id: string) => http.delete<SuccessResponse<string>>(`/tweets/${tweet_id}`),
  createTweet: (body: createdTweet) => http.post<SuccessResponse<Tweets>>('/tweets', body),
  updateTweets: (body: createdTweet) => http.put<SuccessResponse<Tweets>>(`/tweets/edit`, body)
}
export default tweetsApi
