import { StoryType } from '@/types/Stories.types'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

// Chỉ lấy các trường cần thiết cho NewsFeedStory và bao gồm thông tin user
export type NewsFeedStory = Pick<
  StoryType,
  '_id' | 'content' | 'media_url' | 'media_type' | 'caption' | 'viewer' | 'privacy'
> & {
  user: StoryType["user"];
}

const storiesApi = {
  getNewsFeedStories: (limit: number = 5, page: number = 1 )=>
    http.get<SuccessResponse<{ result: NewsFeedStory[]; page: number; total_pages: number }>>(
      `/stories/get-news-feed-stories?limit=${limit}&page=${page}`
    )
    
}

export default storiesApi
