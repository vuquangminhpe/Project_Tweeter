import { Router } from 'express'
import {
  getReportedContentController,
  reportContentController,
  moderateContentController,
  getCommentsController,
  removeCommentController,
  banUserController,
  unbanUserController,
  getUserBanHistoryController,
  getContentModerationStatsController,
  detectToxicContentController
} from '~/controllers/contentModeration.controllers'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { banUserValidator, isAdminValidator } from '~/middlewares/admin.middlewares'
import { wrapAsync } from '~/utils/handler'

const contentModerationRouter = Router()

contentModerationRouter.post('/report', AccessTokenValidator, verifiedUserValidator, wrapAsync(reportContentController))

contentModerationRouter.use(AccessTokenValidator, verifiedUserValidator, isAdminValidator)

contentModerationRouter.get('/reported', AccessTokenValidator, wrapAsync(getReportedContentController))
contentModerationRouter.post('/moderate', AccessTokenValidator, wrapAsync(moderateContentController))

contentModerationRouter.get('/comments', AccessTokenValidator, wrapAsync(getCommentsController))
contentModerationRouter.post('/comments/remove', AccessTokenValidator, wrapAsync(removeCommentController))

contentModerationRouter.post('/users/ban', AccessTokenValidator, banUserValidator, wrapAsync(banUserController))
contentModerationRouter.post('/users/unban', AccessTokenValidator, wrapAsync(unbanUserController))
contentModerationRouter.get('/users/:user_id/ban-history', AccessTokenValidator, wrapAsync(getUserBanHistoryController))

contentModerationRouter.get('/stats', AccessTokenValidator, wrapAsync(getContentModerationStatsController))

contentModerationRouter.post('/detect-toxic', AccessTokenValidator, wrapAsync(detectToxicContentController))

export default contentModerationRouter
