import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  EditTweetRequestBody,
  GenerateTweetRequestBody,
  Pagination,
  TweetParam,
  TweetQuery,
  TweetRequestBody
} from '~/models/request/Tweet.request'
import tweetsService from '~/services/tweets.services'
import { TokenPayload } from '~/models/request/User.request'
import { TWEET_MESSAGE } from '~/constants/messages'
import { TweetType } from '~/constants/enums'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const results = await tweetsService.createTweet(user_id, req.body)
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
  const result = await tweetsService.increaseView(req.params.tweet_id, req.decode_authorization?.user_id)
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    update_at: result.update_at
  }
  res.json({
    message: TWEET_MESSAGE.GET_TWEET_DETAILS_SUCCESS,
    data: tweet
  })
}
export const getTweetChildrenController = async (req: Request<TweetParam, any, any, TweetQuery>, res: Response) => {
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const limit = Number(req.query.limit as string)
  const page = Number(req.query.page as string)
  const user_id = req.decode_authorization?.user_id

  const { total, tweets } = await tweetsService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  })
  res.json({
    message: TWEET_MESSAGE.GET_TWEET_CHILDREN_SUCCESS,
    data: {
      tweets,
      tweet_type,
      limit,
      page,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const getNewTweetController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const limit = Number(req.query.limit as string)
  const page = Number(req.query.page as string)
  const user_id = req.decode_authorization?.user_id

  const { tweets, total } = await tweetsService.getNewFeeds({ limit, page, user_id })

  res.json({
    message: TWEET_MESSAGE.GET_NEW_TWEET_SUCCESS,
    results: tweets,
    total,
    total_pages: Math.ceil(total / limit)
  })
}
export const editTweetController = async (req: Request<ParamsDictionary, any, EditTweetRequestBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const result = await tweetsService.editTweet(user_id, req.body)
  res.json({
    message: TWEET_MESSAGE.EDIT_TWEET_SUCCESS,
    data: result
  })
}
export const deleteTweetController = async (req: Request<ParamsDictionary, any, any, TweetQuery>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.params

  const result = await tweetsService.deleteTweet(user_id, tweet_id as string)
  res.json({
    message: TWEET_MESSAGE.DELETE_TWEET_SUCCESS,
    data: result
  })
}

export const generateTweetTextGeminiController = async (
  req: Request<ParamsDictionary, any, GenerateTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { message } = req.body
  const result = await tweetsService.generateTweetWithTextGemini(user_id, message)
  res.json({
    message: TWEET_MESSAGE.GENERATE_TWEET_GEMINI_SUCCESS,
    data: result
  })
}
export const chatWithGeminiController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { message } = req.body
  console.log('message', message)

  const result = await tweetsService.chatWithGemini(user_id, message)
  res.json({
    message: TWEET_MESSAGE.CHAT_WITH_GEMINI_SUCCESS,
    data: result
  })
}
