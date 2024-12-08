import { Router } from 'express'
import {
  createCommentController,
  deleteCommentController,
  editCommentController,
  getCommentTweetController
} from '~/controllers/comments.controllers'
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
  wrapAsync(getCommentTweetController)
)

/**
 * Description: create comment tweet
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

/**
 * Description: edit comment tweet
 * Path: /
 * Method: POST
 * Body: {tweet_id: string}
 * header: {Authorization:Bearer <access_token> }
 */
commentsRouter.put('/', AccessTokenValidator, verifiedUserValidator, tweetIdValidator, wrapAsync(editCommentController))

/**
 * Description: delete comment tweet
 * Path: /
 * Method: DELETE
 * params: {tweet_id: string}
 * header: {Authorization:Bearer <access_token> }
 */
commentsRouter.delete('/:comment_id', AccessTokenValidator, verifiedUserValidator, wrapAsync(deleteCommentController))
export default commentsRouter
