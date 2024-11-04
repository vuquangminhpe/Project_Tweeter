import { ObjectId } from 'mongodb'

import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import tweetsService from '~/services/tweets.services'
import { TokenPayload } from '~/models/request/User.request'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const results = await tweetsService.createTweet(req.body, user_id)
  res.json({
    message: 'Create Tweet Successfully',
    data: results
  })
}
