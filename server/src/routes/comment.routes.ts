import { Router } from 'express'
import { getCommentTweetController } from '~/controllers/comments.controllers'
import { paginationValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const commentsRouter = Router()

/**
 * Description: get comment
 * Path: /
 * Method: POST
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

export default commentsRouter
