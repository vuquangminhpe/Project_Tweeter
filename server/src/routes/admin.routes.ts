import { Router } from 'express'
import {
  getUserStatisticsController,
  getContentStatisticsController,
  getInteractionStatisticsController,
  getRevenueStatisticsController,
  getSystemStatisticsController,
  getDashboardStatisticsController,
  getUserListController,
  updateUserStatusController,
  updateUserRoleController,
  generateReportController
} from '../controllers/admin.controllers'
import { AccessTokenValidator, verifiedUserValidator } from '../middlewares/users.middlewares'
import { dateRangeValidator, isAdminValidator } from '../middlewares/admin.middlewares'
import { wrapAsync } from '../utils/handler'

const adminRouter = Router()

adminRouter.use(AccessTokenValidator, verifiedUserValidator, isAdminValidator)

adminRouter.get('/dashboard', wrapAsync(getDashboardStatisticsController))

adminRouter.get('/statistics/users', dateRangeValidator, wrapAsync(getUserStatisticsController))
adminRouter.get('/statistics/content', dateRangeValidator, wrapAsync(getContentStatisticsController))
adminRouter.get('/statistics/interactions', dateRangeValidator, wrapAsync(getInteractionStatisticsController))
adminRouter.get('/statistics/revenue', dateRangeValidator, wrapAsync(getRevenueStatisticsController))
adminRouter.get('/statistics/system', dateRangeValidator, wrapAsync(getSystemStatisticsController))

adminRouter.get('/users', wrapAsync(getUserListController))
adminRouter.patch('/users/status', wrapAsync(updateUserStatusController))
adminRouter.patch('/users/role', wrapAsync(updateUserRoleController))

adminRouter.post('/reports/generate', wrapAsync(generateReportController))

export default adminRouter
