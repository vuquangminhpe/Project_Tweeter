import { MediaType } from '@/constants/enum'

export interface SearchRequest {
  content: string
  limit: number
  page: number
  people_follow?: boolean
  media_type?: MediaType
}
