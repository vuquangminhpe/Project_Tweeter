import { Router } from 'express'
import { searchController } from '~/controllers/search.controller'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'
import { makeOptional } from '~/utils/makeOptional'

export const searchRouter = Router()
searchRouter.get(
  '/',
  makeOptional(AccessTokenValidator),
  makeOptional(verifiedUserValidator),
  wrapAsync(searchController)
)
