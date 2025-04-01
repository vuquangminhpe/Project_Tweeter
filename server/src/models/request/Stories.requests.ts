import { MediaTypeQuery } from '../../constants/enums'

export interface createNewStoryResBody {
  content: string
  media_url: string
  media_type: MediaTypeQuery
  caption: string
  privacy: string[]
}
export interface viewAndStatusStoryResBody {
  story_id: string
  content: string
  view_status: string
}
export interface ReactStoryResBody {
  reaction_type: string
}
