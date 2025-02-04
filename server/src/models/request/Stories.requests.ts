import { MediaTypeQuery } from '~/constants/enums'

export interface createNewStoryResBody {
  content: string
  media_url: string
  media_type: MediaTypeQuery
  caption: string
  privacy: string[]
}
