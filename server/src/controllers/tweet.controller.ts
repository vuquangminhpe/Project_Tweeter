import { ObjectId } from 'mongodb'

import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetRequestBody } from '~/models/request/Tweet.request'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  res.send('test')
}
