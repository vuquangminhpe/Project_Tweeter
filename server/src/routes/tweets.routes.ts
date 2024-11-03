import { Router } from 'express'
import { createTweetController } from '~/controllers/tweet.controller'
import { createTweetValidator } from '~/middlewares/tweets.middlewares'
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
