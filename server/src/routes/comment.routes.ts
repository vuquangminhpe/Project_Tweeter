import { Router } from 'express'
import { createCommentController, getCommentTweetController } from '~/controllers/comments.controllers'
import { createCommentValidator, paginationValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const commentsRouter = Router()

/**
 * Description: get comment
 * Path: /
 * Method: GET
 * Body: {tweet_id: string}
 * header: {Authorization:Bearer <access_token> }
 */
commentsRouter.get(
  '/',
  AccessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  tweetIdValidator,
  wrapAsync(getCommentTweetController)
)

/**
 * Description: create comment
 * Path: /
 * Method: POST
 * Body: {tweet_id: string}
 * header: {Authorization:Bearer <access_token> }
 */
commentsRouter.post(
  '/',
  AccessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  createCommentValidator,
  wrapAsync(createCommentController)
)
export default commentsRouter
