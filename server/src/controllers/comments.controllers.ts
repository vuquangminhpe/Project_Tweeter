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

export const createCommentController = async (
  req: Request<ParamsDictionary, any, getCommentTweetReqBody>,
  res: Response
) => {
  const { tweet_id, commentContent, commentLink } = req.body
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const result = await commentServices.createComment(tweet_id, user_id, commentContent, commentLink)
  res.json({ message: COMMENT_MESSAGES.CREATE_COMMENT_SUCCESS, result })
}
export const editCommentController = async (
  req: Request<ParamsDictionary, any, getCommentTweetReqBody>,
  res: Response
) => {
  const { tweet_id, commentContent } = req.body
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const result = await commentServices.editComment(tweet_id, user_id, commentContent)
  res.json({ message: COMMENT_MESSAGES.EDIT_COMMENT_SUCCESS, result })
}
