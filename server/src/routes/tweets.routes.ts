import { Router } from 'express'
import {
  createTweetController,
  getAllTweetController,
  getNewTweetController,
  getTweetChildrenController,
  getTweetDetailsController
} from '~/controllers/tweet.controller'
import {
  audienceValidator,
  createTweetValidator,
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
  paginationValidator,
  AccessTokenValidator,
  verifiedUserValidator,
  wrapAsync(getNewTweetController)
)
