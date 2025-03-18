import { SearchRequest } from '@/types/Search.type'
import { Tweets } from '@/types/Tweet.type'
import { SuccessResponse } from '@/types/Utils.type'
import { MediaType } from '@/constants/enum'
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
    
    // Only add media_type if it has a valid value, and convert enum to string
    if (params.media_type !== undefined) {
      // Make sure we're sending the exact string values expected by the API
      if (params.media_type === MediaType.Image) {
        searchParams.media_type = 'image'
      } else if (params.media_type === MediaType.Video) {
        searchParams.media_type = 'video'
      }
    }
    
    return http.get<SuccessResponse<SearchResponse>>('/search', { params: searchParams })
  },
  
  clearCache: (pattern?: string) => 
    http.post<SuccessResponse<null>>('/search/cache/clear', { pattern })
}

export default searchApis