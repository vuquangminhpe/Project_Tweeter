import { Tweets } from '@/types/Tweet.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const tweetsApi = {
  getAllTweets: () => http.get<SuccessResponse<Tweets[]>>('/tweets'),
  getTweetComments: (tweetId: string, limit: number, page: number, tweet_type: number) =>
    http.get<SuccessResponse<Tweets[]>>(
      `/tweets/${tweetId}/children?limit=${limit}&page=${page}&tweet_type=${tweet_type}`
    )
}
export default tweetsApi
