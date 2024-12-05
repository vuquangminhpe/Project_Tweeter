import { Likes } from '@/types/Likes.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const likesApi = {
  getLikesTweet: (tweet_id: string) => http.get<SuccessResponse<Likes[]>>(`/likes/${tweet_id}`),
  likeTweet: (tweet_id: string) => http.post<SuccessResponse<string>>(`/likes`, { tweet_id }),
  unlikeTweet: (tweet_id: string) => http.delete<SuccessResponse<string>>(`/likes/${tweet_id}`)
}
export default likesApi
