import { Bookmark } from '@/types/Bookmarks.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const bookmarksApi = {
  getBookmarks: () => http.get<SuccessResponse<Bookmark[]>>('/bookmarks'),
  bookmarkTweet: (tweet_id: string) => http.post<SuccessResponse<Bookmark[]>>('/bookmarks/', { tweet_id }),
  unBookmarkTweet: (tweet_id: string) => http.delete<SuccessResponse<{ message: string }>>(`/bookmarks/${tweet_id}`)
}
export default bookmarksApi
