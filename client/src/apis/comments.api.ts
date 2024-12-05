import { createCommentType } from '@/types/Comments.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const commentApi = {
  getTweetComments: (tweet_id: string, limit: number, page: number) =>
    http.get<SuccessResponse<Comment[]>>('/comments/', {
      params: {
        tweet_id,
        limit,
        page
      }
    }),
  createComment: (body: createCommentType) => http.post<SuccessResponse<Comment>>('/comments/', body)
}
export default commentApi
