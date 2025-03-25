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
import { isAdminValidator } from '~/middlewares/admin.middlewares'
import { wrapAsync } from '~/utils/handler'

const contentModerationRouter = Router()

contentModerationRouter.post('/report', AccessTokenValidator, verifiedUserValidator, wrapAsync(reportContentController))

contentModerationRouter.use(AccessTokenValidator, verifiedUserValidator, isAdminValidator)

contentModerationRouter.get('/reported', wrapAsync(getReportedContentController))
contentModerationRouter.post('/moderate', wrapAsync(moderateContentController))

contentModerationRouter.get('/comments', wrapAsync(getCommentsController))
contentModerationRouter.post('/comments/remove', wrapAsync(removeCommentController))

contentModerationRouter.post('/users/ban', wrapAsync(banUserController))
contentModerationRouter.post('/users/unban', wrapAsync(unbanUserController))
contentModerationRouter.get('/users/:user_id/ban-history', wrapAsync(getUserBanHistoryController))

contentModerationRouter.get('/stats', wrapAsync(getContentModerationStatsController))

contentModerationRouter.post('/detect-toxic', wrapAsync(detectToxicContentController))

export default contentModerationRouter
