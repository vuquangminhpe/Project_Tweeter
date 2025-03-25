import { SuccessResponse } from '@/types/Utils.type'
import { Tweets } from '@/types/Tweet.type'
import { MediaType } from '@/constants/enum'
import http from '@/utils/http'

export interface SearchRequest {
  content: string
  page?: number
  limit?: number
  media_type?: MediaType
  search_users?: boolean
}

interface TweetSearchResponse {
  tweets: Tweets[]
  total_pages: number
  total_tweets: number
  limit: number
  page: number
  execution_time_ms: number
}

interface UserSearchResponse {
  users: {
    _id: string
    name: string
    username: string
    avatar: string
    created_at: string
    bio: string
    location: string
    website: string
    is_followed: boolean
  }[]
  total_pages: number
  total_users: number
  limit: number
  page: number
  execution_time_ms: number
}

const searchApis = {
  searchTweets: (params: Omit<SearchRequest, 'search_users'>) => {
    const searchParams: Record<string, any> = {
      content: params.content,
      page: params.page || 1,
      limit: params.limit || 5
    }

    // Chỉ thêm media_type nếu có giá trị hợp lệ
    if (params.media_type !== undefined) {
      searchParams.media_type = params.media_type === MediaType.Image ? 'image' : 'video'
    }

    return http.get<SuccessResponse<TweetSearchResponse>>('/search', { params: searchParams })
  },

  searchUsers: (params: Omit<SearchRequest, 'media_type'>) => {
    const searchParams: Record<string, any> = {
      content: params.content,
      page: params.page || 1,
      limit: params.limit || 5,
      search_users: true
    }

    return http.get<SuccessResponse<UserSearchResponse>>('/search', { params: searchParams })
  },

  clearCache: (pattern?: string) => 
    http.post<SuccessResponse<null>>('/search/cache/clear', { pattern })
}

export default searchApis