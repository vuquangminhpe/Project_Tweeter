import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/request/Search.requests'
import searchService from '~/services/search.services'
export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_ID = req.decode_authorization?.user_id
  const people_follow = Boolean(req.query.people_follow)

  const result = await searchService.search({
    limit,
    page,
    content: req.query.content,
    media_type: req.query.media_type,
    people_follow,
    user_id: req.decode_authorization?.user_id
  })
  res.json({
    message: 'Search success',
    result
  })
}
