import { Request, Response } from 'express'
import { ADMIN_MESSAGES } from '~/constants/messages'
import {
  UserStatsQuery,
  ContentStatsQuery,
  InteractionStatsQuery,
  RevenueStatsQuery,
  SystemStatsQuery,
  AdminUserListQuery,
  UpdateUserStatusBody,
  UpdateUserRoleBody,
  GenerateReportBody
} from '~/models/request/Admin.request'
import { UserRole } from '~/models/schemas/User.schema'
import adminService from '~/services/admin.services'

export const getUserStatisticsController = async (req: Request<any, any, any, UserStatsQuery>, res: Response) => {
  const result = await adminService.getUserStatistics(req.query)

  res.json({
    message: ADMIN_MESSAGES.GET_USER_STATS_SUCCESS,
    result
  })
}

export const getContentStatisticsController = async (req: Request<any, any, any, ContentStatsQuery>, res: Response) => {
  const result = await adminService.getContentStatistics(req.query)

  res.json({
    message: ADMIN_MESSAGES.GET_TWEET_STATS_SUCCESS,
    result
  })
}

export const getInteractionStatisticsController = async (
  req: Request<any, any, any, InteractionStatsQuery>,
  res: Response
) => {
  const result = await adminService.getInteractionStatistics(req.query)

  res.json({
    message: ADMIN_MESSAGES.GET_INTERACTION_STATS_SUCCESS,
    result
  })
}

export const getRevenueStatisticsController = async (req: Request<any, any, any, RevenueStatsQuery>, res: Response) => {
  const result = await adminService.getRevenueStatistics(req.query)

  res.json({
    message: ADMIN_MESSAGES.GET_REVENUE_STATS_SUCCESS,
    result
  })
}

export const getSystemStatisticsController = async (req: Request<any, any, any, SystemStatsQuery>, res: Response) => {
  const result = await adminService.getSystemStatistics(req.query)

  res.json({
    message: ADMIN_MESSAGES.GET_SYSTEM_STATS_SUCCESS,
    result
  })
}

export const getDashboardStatisticsController = async (req: Request, res: Response) => {
  const result = await adminService.getDashboardStatistics()

  res.json({
    message: ADMIN_MESSAGES.GET_DASHBOARD_STATS_SUCCESS,
    result
  })
}

export const getUserListController = async (req: Request<any, any, any, AdminUserListQuery>, res: Response) => {
  const result = await adminService.getUserList(req.query)

  res.json({
    message: ADMIN_MESSAGES.GET_USER_LIST_SUCCESS,
    result
  })
}

export const updateUserStatusController = async (req: Request<any, any, UpdateUserStatusBody>, res: Response) => {
  const { user_id, status } = req.body

  const result = await adminService.updateUserStatus(user_id, status)

  res.json({
    message: ADMIN_MESSAGES.USER_STATUS_UPDATED_SUCCESS,
    result
  })
}

export const updateUserRoleController = async (req: Request<any, any, UpdateUserRoleBody>, res: Response) => {
  const { user_id, role } = req.body

  const result = await adminService.updateUserRole(user_id, role as UserRole)

  res.json({
    message: ADMIN_MESSAGES.USER_ROLE_UPDATED_SUCCESS,
    result
  })
}

export const generateReportController = async (req: Request<any, any, GenerateReportBody>, res: Response) => {
  const { report_type, from_date, to_date, format } = req.body

  const result = await adminService.generateReport(report_type, from_date, to_date, format)

  res.json({
    message: ADMIN_MESSAGES.GENERATE_REPORT_SUCCESS,
    result
  })
}
