import { getFollowersResponse } from '@/types/User.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const conversationsApi = {
  getAllConversationsWithFollower: (limit: number, page: number) =>
    http.get<SuccessResponse<getFollowersResponse[]>>(`conversations/all_conversation?limit=${limit}&page=${page}`)
}
export default conversationsApi
