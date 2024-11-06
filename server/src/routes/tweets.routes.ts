import { Router } from 'express'
import { createTweetController, getAllTweetController, getTweetDetailsController } from '~/controllers/tweet.controller'
import { audienceValidator, createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

export const tweetsRouter = Router()

/**
 * Description: Create Tweet
 * Path: /
 * Method: POST
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
 * type: tweetTypes
 */
tweetsRouter.get('/', AccessTokenValidator, verifiedUserValidator, wrapAsync(getAllTweetController))

/**
 * Description: get Tweet details
 * Path: /
 * Method: GET
 * Body: user_id: string
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
