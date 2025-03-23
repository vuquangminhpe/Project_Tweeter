/* eslint-disable @typescript-eslint/no-explicit-any */
import { StoryType } from '@/types/Stories.types'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

export type NewsFeedStory = Pick<
  StoryType,
  '_id' | 'content' | 'media_url' | 'media_type' | 'caption' | 'viewer' | 'privacy' | 'created_at' | 'update_at'
> & {
  user: StoryType['user']
}

export interface CreateStoryRequest {
  content: string
  media_url?: string
  media_type?: string
  caption?: string
  privacy?: string[]
}

export interface StoryReactionRequest {
  story_id: string
  reaction: string
}

export interface StoryCommentRequest {
  story_id: string
  content: string
}

export interface ViewStoryRequest {
  story_id: string
  view_status: string
  content: string
}

const storiesApi = {
  getNewsFeedStories: (limit: number = 10, page: number = 1) =>
    http.get<SuccessResponse<{ result: NewsFeedStory[]; page: number; total_pages: number }>>(
      `/stories/get-news-feed-stories?limit=${limit}&page=${page}`
    ),

  getArchiveStories: (limit: number = 10, page: number = 1) =>
    http.get<SuccessResponse<{ result: NewsFeedStory[]; page: number; total_pages: number }>>(
      `/stories/get-archive-stories?limit=${limit}&page=${page}`
    ),

  getStoryById: (id: string) => http.get<SuccessResponse<NewsFeedStory>>(`/stories/${id}`),

  createStory: (story: CreateStoryRequest) => http.post<SuccessResponse<NewsFeedStory>>('/stories/create-story', story),

  updateStory: (story: CreateStoryRequest & { story_id: string }) =>
    http.post<SuccessResponse<NewsFeedStory>>('/stories/update-story', story),

  deleteStory: (id: string) => http.delete<SuccessResponse<{ message: string }>>(`/stories/delete-story/${id}`),

  viewStory: (data: ViewStoryRequest) =>
    http.post<SuccessResponse<{ message: string }>>('/stories/view-and-status-story', data),

  getStoryViewers: (id: string) => http.get<SuccessResponse<{ viewer: any[] }>>(`/stories/get-story-viewers/${id}`),

  addStoryReaction: (data: StoryReactionRequest) =>
    http.post<SuccessResponse<{ message: string }>>(`/stories/react-story/${data.story_id}`, {
      reaction_type: data.reaction
    }),

  addStoryComment: (data: StoryCommentRequest) =>
    http.post<SuccessResponse<{ message: string }>>(`/stories/reply-story/${data.story_id}`, {
      content: data.content
    }),

  hideUserStories: (userId: string) =>
    http.post<SuccessResponse<{ message: string }>>(`/stories/hide-user-stories/${userId}`, {})
}

export default storiesApi
