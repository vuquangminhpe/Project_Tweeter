import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SEARCH_MESSAGE } from '../constants/messages'
import { SearchQuery } from '../models/request/Search.requests'
import searchService from '../services/search.services'
export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const people_follow = Boolean(req.query.people_follow)
  const search_users = Boolean(req.query.search_users) || false
  const result = !search_users
    ? await searchService.search({
        limit,
        page,
        content: req.query.content,
        media_type: req.query.media_type,
        people_follow,
        user_id: req.decode_authorization?.user_id
      })
    : await searchService.searchUsers({
        limit,
        page,
        content: req.query.content,
        user_id: req.decode_authorization?.user_id
      })
  res.json({
    message: search_users ? SEARCH_MESSAGE.SEARCH_PEOPLE_SUCCESS : SEARCH_MESSAGE.SEARCH_TWEETS_SUCCESS,
    result
  })
}
