import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LIKES_MESSAGE } from '~/constants/messages'
import { LikeTweetReqBody } from '~/models/request/Likes.request'
import { TokenPayload } from '~/models/request/User.request'
import { likeType } from '~/models/schemas/Like.schema'
import likesTweet from '~/services/likes.services'

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await likesTweet.likeTweet(user_id, tweet_id)
  res.json({
    result
  })
}

export const unLikeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await likesTweet.unLikesTweet(user_id, tweet_id)
  res.json({
    result
  })
}

export const getLikeTweetController = async (req: Request<ParamsDictionary, any, likeType>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await likesTweet.getLikesTweet(user_id)
  res.json({
    result
  })
}
