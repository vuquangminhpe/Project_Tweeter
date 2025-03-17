import { SearchRequest } from '@/types/Search.type'
import { Tweets } from '@/types/Tweet.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

export interface SearchResponse {
  tweets: Tweets[]
  total_pages: number
  total_tweets: number
  limit: number
  page: number
  execution_time_ms: number
}

const searchApis = {
  search: (params: SearchRequest) => {
    // Create a base params object with required fields
    const searchParams: Record<string, any> = {
      content: params.content || '',
      limit: params.limit || 5, // Default to 5 results
      page: params.page || 1
    }
    
    // Only add media_type if it has a valid value
    if (params.media_type) {
      searchParams.media_type = params.media_type
    }
    
    // Only add people_follow if it's true (default is false)
    if (params.people_follow) {
      searchParams.people_follow = params.people_follow
    }
    
    return http.get<SuccessResponse<SearchResponse>>('/search', { params: searchParams })
  },
  
  clearCache: (pattern?: string) => 
    http.post<SuccessResponse<null>>('/search/cache/clear', { pattern })
}

export default searchApis