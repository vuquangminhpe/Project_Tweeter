import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/request/Search.requests'
import searchService from '~/services/search.services'
export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await searchService.search({
    limit,
    page,
    content: req.query.content,
    user_id: req.decode_authorization?.user_id as string
  })
  res.json({
    message: 'Search success',
    result
  })
}
