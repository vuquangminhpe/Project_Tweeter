import { ObjectId } from 'mongodb'

import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import tweetsService from '~/services/tweets.services'
import { TokenPayload } from '~/models/request/User.request'
import { TWEET_MESSAGE } from '~/constants/messages'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const results = await tweetsService.createTweet(req.body, user_id)
  res.json({
    message: TWEET_MESSAGE.CREATE_TWEET_SUCCESS,
    data: results
  })
}

export const getAllTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const results = await tweetsService.getTweet(user_id)
  res.json({
    message: TWEET_MESSAGE.GET_TWEET_SUCCESS,
    data: results
  })
}

export const getTweetDetailsController = async (req: Request, res: Response) => {
  const { tweet_id } = req.params
  const results = await tweetsService.getTweetDetails(tweet_id)
  res.json({
    message: TWEET_MESSAGE.GET_TWEET_DETAILS_SUCCESS,
    data: results
  })
}
