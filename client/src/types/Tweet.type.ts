import { TweetAudience, TweetType } from '@/constants/enum'
import { Media } from './Medias.type'

export interface Tweets {
  _id?: string
  user_id: string
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}
