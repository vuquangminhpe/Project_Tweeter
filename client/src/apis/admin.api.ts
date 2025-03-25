/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ContentStats,
  ContentStatsParams,
  DashboardStats,
  InteractionStats,
  InteractionStatsParams,
  ModerationStats,
  ReportedContentParams,
  ReportedContentResponse,
  ReportParams,
  RevenueStats,
  RevenueStatsParams,
  UserListParams,
  UserListResponse,
  UserStats,
  UserStatsParams
} from '@/types/Admin.types'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const adminApi = {
  getDashboardStats: () => http.get<SuccessResponse<DashboardStats>>('/admin/dashboard'),

  getUserStats: (params: UserStatsParams = {}) =>
    http.get<SuccessResponse<UserStats>>('/admin/statistics/users', { params }),

  getContentStats: (params: ContentStatsParams = {}) =>
    http.get<SuccessResponse<ContentStats>>('/admin/statistics/content', { params }),

  getInteractionStats: (params: InteractionStatsParams = {}) =>
    http.get<SuccessResponse<InteractionStats>>('/admin/statistics/interactions', { params }),

  getRevenueStats: (params: RevenueStatsParams = {}) =>
    http.get<SuccessResponse<RevenueStats>>('/admin/statistics/revenue', { params }),

  getUserList: (params: UserListParams = {}) => http.get<SuccessResponse<UserListResponse>>('/admin/users', { params }),

  updateUserStatus: (user_id: string, status: number) =>
    http.patch<SuccessResponse<{ success: boolean }>>('/admin/users/status', { user_id, status }),

  updateUserRole: (user_id: string, role: string) =>
    http.patch<SuccessResponse<{ success: boolean }>>('/admin/users/role', { user_id, role }),

  generateReport: (params: ReportParams) => http.post<SuccessResponse<any>>('/admin/reports/generate', params),

  getReportedContent: (params: ReportedContentParams = {}) =>
    http.get<SuccessResponse<ReportedContentResponse>>('/moderation/reported', { params }),

  moderateContent: (report_id: string, action: string, reason: string) =>
    http.post<SuccessResponse<{ success: boolean }>>('/moderation/moderate', { report_id, action, reason }),

  getModerationStats: () => http.get<SuccessResponse<ModerationStats>>('/moderation/stats')
}

export default adminApi
