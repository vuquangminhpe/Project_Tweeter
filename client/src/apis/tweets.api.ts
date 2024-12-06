import { Tweets } from '@/types/Tweet.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const tweetsApi = {
  getAllTweets: () => http.get<SuccessResponse<Tweets[]>>('/tweets'),
  deleteTweet: (tweet_id: string) => http.delete<SuccessResponse<string>>(`/tweets/${tweet_id}`),
  createTweet: (body: FormData) => http.post<SuccessResponse<Tweets>>('/tweets', body)
}
export default tweetsApi
