import { MediaType } from '@/constants/enum'
import { Tweets } from '@/types/Tweet.type'
import http from '@/utils/http'

export interface SearchResult {
  message: string
  result: {
    tweets: Tweets[]
    total_pages: number
    limit: number
    page: number
  }
}


export interface SearchParams {
  content: string
  media_type?: MediaType
  people_follow?: boolean
  limit?: number
  page?: number
}

export const searchApi = {
  /**
   * Search tweets with pagination and filters
   */
  search: (params: SearchParams) => {
    // Ensure all required parameters are present
    const queryParams = {
      content: params.content,
      limit: params.limit || 10,
      page: params.page || 1
    }
    
    // Only add optional parameters if they're defined
    if (params.media_type !== undefined) {
      Object.assign(queryParams, { media_type: params.media_type })
    }
    
    if (params.people_follow !== undefined) {
      Object.assign(queryParams, { people_follow: params.people_follow })
    }
    
    console.log('[DEBUG] Search API request params:', queryParams)
    
    return http.get<SearchResult>('/search', { params: queryParams })
      .catch(error => {
        console.error('[DEBUG] Search API error caught:', error)
        // Return a rejected promise that won't cause "cannot read properties" errors
        return Promise.reject({
          message: error.message || 'Search failed',
          status: error.status || 500
        })
      })
  },
  
  /**
   * Quick search for autocomplete suggestions
   * Returns limited results for dropdown display
   */
  quickSearch: (content: string) => {
    if (!content || content.trim() === '') {
      console.log('[DEBUG] Empty content for quickSearch, returning empty promise')
      const emptyResult: SearchResult = {
        message: "No results found",
        result: {
          tweets: [],
          total_pages: 0,
          limit: 5,
          page: 1
        }
      }
      return Promise.resolve({ data: emptyResult })
    }
    
    console.log('[DEBUG] Calling quick search with content:', content)
    
    // Match exactly what the backend expects - content, limit and page
    return http.get<SearchResult>('/search', {
      params: {
        content: content.trim(),
        limit: 5,
        page: 1
      }
    })
    .catch(error => {
      console.error('[DEBUG] Quick Search API error caught:', error)
      // Return a rejected promise that won't cause "cannot read properties" errors
      return Promise.reject({
        message: error.message || 'Quick search failed',
        status: error.status || 500
      })
    })
  }
}
