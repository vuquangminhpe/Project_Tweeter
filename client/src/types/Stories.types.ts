import { Media } from './Medias.type'
import { User } from './User.type';

// Giao thức trả về sau khi tạo mới story
export interface CreateNewStoryResBody {
    content: string;
    media_url: string;
    media_type: Media[];
    caption: string;
    privacy: string[];
  }
  
  // Giao thức trả về sau khi cập nhật trạng thái xem của story
  export interface ViewAndStatusStoryResBody {
    story_id: string;
    content: string;
    view_status: string;
  }
  
  // Định nghĩa kiểu dữ liệu cho người xem (viewer) của story
  export interface ViewerType {
    viewer_id: string[];
    seen_at: Date;
    content: string;
    view_status: string;
  }
  
  // Định nghĩa kiểu dữ liệu cho Story
  export interface StoryType {
    // Các id từ backend (ObjectId) sẽ chuyển về string ở FE
    _id?: string;
    user_id: string;
    media_url: string;
    media_type: Media[];
    caption?: string;
    content: string;
    created_at?: Date;
    expires_at?: Date;
    update_at?: Date;
    viewer: ViewerType[];
    is_active: boolean;
    privacy: string[];
    user: User;
  }