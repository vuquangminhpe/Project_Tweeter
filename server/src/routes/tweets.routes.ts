import { Router } from 'express'
import {
  createTweetController,
  deleteTweetController,
  editTweetController,
  getAllTweetController,
  getNewTweetController,
  getTweetChildrenController,
  getTweetDetailsController
} from '~/controllers/tweet.controllers'
import {
  audienceValidator,
  createTweetValidator,
  deleteTweetValidator,
  editTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

export const tweetsRouter = Router()

/**
 * Description: Create Tweet
 * Path: /
 * Method: POST
 *  * Header: {Authorization: Bearer <access_token>}
 * Body: TweetRequestBody
 */
tweetsRouter.post(
  '/',
  AccessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapAsync(createTweetController)
)

/**
 * Description: get All Tweet
 * Path: /
 * Method: GET
 * Body: user_id: string
 *  * Header: {Authorization: Bearer <access_token>}
 * type: tweetTypes
 */
tweetsRouter.get('/', AccessTokenValidator, verifiedUserValidator, wrapAsync(getAllTweetController))

/**
 * Description: get Tweet details
 * Path: /
 * Method: GET
 * Body: user_id: string
 *  * Header: {Authorization: Bearer <access_token>}
 * type: tweetTypes
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  AccessTokenValidator,
  verifiedUserValidator,
  wrapAsync(audienceValidator),
  wrapAsync(getTweetDetailsController)
)

/**
 * Description: get Tweet Children
 * Path: /:tweet_id/children
 * Method: GET
 * Body: user_id: string
 * type: tweetTypes
 *  * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number,page:number,tweet_type: TweetType}
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  getTweetChildrenValidator,
  AccessTokenValidator,
  verifiedUserValidator,
  wrapAsync(audienceValidator),
  wrapAsync(getTweetChildrenController)
)

/**
 * Description: get new feeds
 * Path: /new-feeds
 * Method: GET
 * Body: user_id: string
 * type: tweetTypes
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number,page:number,tweet_type: TweetType}
 */
tweetsRouter.get(
  '/new/new-feeds',

  AccessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapAsync(getNewTweetController)
)

/**
 * Description: edit tweet
 * Path: /edit
 * Method: PUT
 * Body:  tweet_id: string, new_tweetContent: string
 * Header: {Authorization: Bearer <access_token>}
 */
tweetsRouter.put(
  '/edit',
  AccessTokenValidator,
  verifiedUserValidator,
  editTweetValidator,
  wrapAsync(editTweetController)
)

/**
 * Description: delete tweet
 * Path: /:tweet_id
 * Method: PUT
 * Header: {Authorization: Bearer <access_token>}
 */
tweetsRouter.delete(
  '/:tweet_id',
  AccessTokenValidator,
  verifiedUserValidator,
  deleteTweetValidator,
  wrapAsync(deleteTweetController)
)
