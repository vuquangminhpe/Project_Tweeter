import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/request/User.request'
import { BookmarkTweetReqBody } from '~/models/request/bookmarks.requests'
import bookmarksService from '~/services/bookmarks.services'
import { BOOKMARKS_MESSAGE } from '~/constants/messages'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const results = await bookmarksService.bookmarkTweet(user_id, req.body.tweet_id)
  res.json({
    message: BOOKMARKS_MESSAGE.BOOKMARKS_TWEET_SUCCESS,
    data: results
  })
}
export const unBookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.params
  const results = await bookmarksService.unBookmarkTweet(user_id, tweet_id)
  res.json({
    message: BOOKMARKS_MESSAGE.UN_BOOKMARKS_TWEET_SUCCESS,
    data: results
  })
}
