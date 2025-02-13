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
  getNewsFeedStories: async (limit: number = 5, page: number = 1) => {
    try {
      const response = await http.get<SuccessResponse<NewsFeedStory[]>>(
        `/stories/get-news-feed-stories?limit=${limit}&page=${page}`
      )
      console.log("Fetched news feed stories:", response.data)
      return response
    } catch (error) {
      console.error("Error fetching news feed stories:", error)
      throw error
    }
  }
}

export default storiesApi
