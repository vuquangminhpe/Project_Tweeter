import { Router } from 'express'
import { getLikeTweetController, likeTweetController, unLikeTweetController } from '../controllers/likes.controllers'
import { tweetIdValidator } from '../middlewares/tweets.middlewares'
import { AccessTokenValidator, verifiedUserValidator } from '../middlewares/users.middlewares'
import { wrapAsync } from '../utils/handler'
export const likesTweetRouter = Router()
/**
 * Description: Like Tweet
 * Path: /
 * Method: POST
 * Body: {tweet_id: string}
 * header: {Authorization:Bearer <access_token> }
 */
likesTweetRouter.post(
  '/',
  AccessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapAsync(likeTweetController)
)

/**
 * Description:Unlike Tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Body: {tweet_id: string}
 * header: {Authorization:Bearer <access_token> }
 */
likesTweetRouter.delete(
  '/:tweet_id',
  AccessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapAsync(unLikeTweetController)
)

/**
 * Description:Get likes tweet
 * Path: /
 * Method: GET
 * Body: {tweet_id: string}
 * header: {Authorization:Bearer <access_token> }
 * type: likesType
 */
likesTweetRouter.get(
  '/:tweet_id',
  AccessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapAsync(getLikeTweetController)
)
