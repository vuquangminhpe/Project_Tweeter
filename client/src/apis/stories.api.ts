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

// Types for story interactions
export interface StoryReactionRequest {
  story_id: string;
  reaction: string;
}

export interface StoryCommentRequest {
  story_id: string;
  content: string;
}

const storiesApi = {
  getNewsFeedStories: (limit: number = 5, page: number = 1 )=>
    http.get<SuccessResponse<{ result: NewsFeedStory[]; page: number; total_pages: number }>>(
      `/stories/get-news-feed-stories?limit=${limit}&page=${page}`
    ),
    
  // New methods for story interactions
  getStoryById: (id: string) => 
    http.get<SuccessResponse<NewsFeedStory>>(`/stories/${id}`),
    
  addStoryReaction: (body: StoryReactionRequest) =>
    http.post<SuccessResponse<{ message: string }>>('/stories/reaction', body),
    
  addStoryComment: (body: StoryCommentRequest) =>
    http.post<SuccessResponse<{ message: string }>>('/stories/comment', body)
}

export default storiesApi
