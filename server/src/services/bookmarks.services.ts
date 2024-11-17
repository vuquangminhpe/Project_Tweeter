import { Bookmark } from '~/models/schemas/Bookmark.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { BOOKMARKS_MESSAGE } from '~/constants/messages'

class BookmarkService {
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const isExitsBookmarks = await databaseService.bookmarks.findOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    if (isExitsBookmarks)
      return {
        message: BOOKMARKS_MESSAGE.BOOKMARK_ALREADY_EXISTS
      }
    const results = await databaseService.bookmarks.insertOne(
      new Bookmark({
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      })
    )
    return { _id: results.insertedId }
  }
  async unBookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.deleteOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }
  async getBookmarkTweet(user_id: string) {
    const result = await databaseService.bookmarks
      .find({
        user_id: new ObjectId(user_id)
      })
      .toArray()
    return result
  }
}

const bookmarksService = new BookmarkService()
export default bookmarksService
