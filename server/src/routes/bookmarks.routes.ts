import { Router } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const bookmarksRouter = Router()

/**
 * Description: Bookmark Tweet
 * Path: /
 * Method: POST
 * Body: {tweet_id: string}
 * header: {Authorization:Bearer <access_token> }
 */
bookmarksRouter.post('/', AccessTokenValidator, verifiedUserValidator, wrapAsync(bookmarkTweetController))

/**
 * Description:Un Bookmark Tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Body: {tweet_id: string}
 * header: {Authorization:Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  AccessTokenValidator,
  verifiedUserValidator,
  wrapAsync(unBookmarkTweetController)
)
export default bookmarksRouter
