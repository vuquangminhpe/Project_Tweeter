import { SearchRequest } from '@/types/Search.type'
import { Tweets } from '@/types/Tweet.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const searchApis = {
  search: (params: SearchRequest) => http.get<SuccessResponse<Tweets[]>>('/search', { params })
}
export default searchApis
