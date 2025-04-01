import { ObjectId } from 'mongodb'
import { MediaTypeQuery } from '../../constants/enums'
interface ViewerType {
  viewer_id: ObjectId[]
  seen_at: Date
  content: string
  view_status: string
}
interface StoryType {
  _id?: ObjectId
  user_id: ObjectId
  media_url: string
  media_type: MediaTypeQuery
  caption?: string
  content: string
  created_at?: Date
  expires_at?: Date
  update_at?: Date
  viewer: ViewerType[]
  is_active: boolean
  privacy: string[]
}

export default class Stories {
  _id?: ObjectId
  user_id: ObjectId
  media_url: string
  media_type: MediaTypeQuery
  caption?: string
  content: string
  created_at?: Date
  expires_at?: Date
  update_at?: Date
  viewer: ViewerType[]
  is_active: boolean
  privacy: string[]
  constructor({
    _id,
    user_id,
    media_url,
    media_type,
    caption,
    content,
    created_at,
    expires_at,
    update_at,
    viewer,
    is_active,
    privacy
  }: StoryType) {
    const date = new Date()
    this._id = _id
    this.user_id = user_id
    this.media_url = media_url
    this.media_type = media_type
    this.caption = caption
    this.content = content
    this.created_at = created_at || date
    this.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000)
    this.update_at = update_at || date
    this.viewer = viewer || []
    this.is_active = is_active
    this.privacy = privacy
  }
}
