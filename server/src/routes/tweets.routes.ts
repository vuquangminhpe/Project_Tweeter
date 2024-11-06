import { Router } from 'express'
import { createTweetController, getAllTweetController, getTweetDetailsController } from '~/controllers/tweet.controller'
import { createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { AccessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
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
  isUserLoggedInValidator(AccessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
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
tweetsRouter.get(
  '/',
  isUserLoggedInValidator(AccessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapAsync(getAllTweetController)
)

/**
 * Description: get Tweet details
 * Path: /
 * Method: GET
 * Body: user_id: string
 * type: tweetTypes
 */
tweetsRouter.get(
  '/:tweet_id',
  isUserLoggedInValidator(AccessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  tweetIdValidator,
  wrapAsync(getTweetDetailsController)
)
