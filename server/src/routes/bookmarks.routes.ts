import { Router } from 'express'
import {
  bookmarkTweetController,
  getBookmarkTweetController,
  unBookmarkTweetController
} from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
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
bookmarksRouter.post(
  '/',
  AccessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapAsync(bookmarkTweetController)
)

/**
 * Description:Un Bookmark Tweet
 * Path: /:tweet_id
 * Method: DELETE
 * Body: {tweet_id: string}
 * header: {Authorization:Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/:tweet_id',
  AccessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapAsync(unBookmarkTweetController)
)

/**
 * Description: Bookmark Tweet
 * Path: /
 * Method: GET
 * Body: {users_id: string}
 * header: {Authorization:Bearer <access_token> }
 *
 */
bookmarksRouter.get('/', AccessTokenValidator, verifiedUserValidator, wrapAsync(getBookmarkTweetController))
export default bookmarksRouter
