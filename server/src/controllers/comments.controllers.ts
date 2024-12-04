import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { COMMENT_MESSAGES } from '~/constants/messages'
import { getCommentTweetReqBody } from '~/models/request/Comments.requests'
import { TokenPayload } from '~/models/request/User.request'
import commentServices from '~/services/comments.services'
export const getCommentTweetController = async (
  req: Request<ParamsDictionary, any, getCommentTweetReqBody>,
  res: Response
) => {
  const { tweet_id } = req.body
  const { limit, page } = req.query
  const { comment, total } = await commentServices.getAllCommentInTweet(tweet_id, Number(limit), Number(page))
  res.json({
    message: COMMENT_MESSAGES.GET_COMMENT_SUCCESS,
    results: {
      comment,
      page: Number(page),
      total_pages: Math.round(total / Number(limit))
    }
  })
}
