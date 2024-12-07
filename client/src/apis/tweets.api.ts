import { Tweets } from '@/types/Tweet.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'
type createdTweet = Omit<Tweets, '_id' | 'user_id' | 'created_at' | 'updated_at' | 'guest_views' | 'user_views'>
const tweetsApi = {
  getAllTweets: () => http.get<SuccessResponse<Tweets[]>>('/tweets'),
  deleteTweet: (tweet_id: string) => http.delete<SuccessResponse<string>>(`/tweets/${tweet_id}`),
  createTweet: (body: createdTweet) => http.post<SuccessResponse<Tweets>>('/tweets', body),
  
}
export default tweetsApi
