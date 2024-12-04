import { Tweets } from '@/types/Tweet.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const tweetsApi = {
  getAllTweets: () => http.get<SuccessResponse<Tweets[]>>('/tweets')
}
export default tweetsApi
