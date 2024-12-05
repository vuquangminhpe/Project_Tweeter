import { Likes } from '@/types/Likes.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const likesApi = {
  getLikesTweet: (tweet_id: string) => http.get<SuccessResponse<Likes[]>>(`/likes/${tweet_id}`)
}
export default likesApi
