import { Request, Response } from 'express'
import {
  BanUserBody,
  ContentModerationQuery,
  GetBanHistoryParams,
  ModerateContentBody,
  ReportContentBody,
  UnbanUserBody
} from '../models/request/Moderation.request'
import contentModerationService from '~/services/contentModeration.services'
import { TokenPayload } from '~/models/request/User.request'
import { ReportStatus } from '~/models/request/Moderation.request'
import { ObjectId } from 'mongodb'
import { ADMIN_MESSAGES } from '~/constants/messages'

export const getReportedContentController = async (
  req: Request<any, any, any, ContentModerationQuery>,
  res: Response
) => {
  const result = await contentModerationService.getReportedContent(req.query)

  res.json({
    message: ADMIN_MESSAGES.GET_REPORTED_CONTENT_SUCCESS,
    result
  })
}

export const reportContentController = async (req: Request<any, any, ReportContentBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await contentModerationService.reportContent(user_id, {
    content_id: req.body.content_id,
    content_type: req.body.content_type,
    reason: req.body.reason,
    description: req.body.description
  })

  res.json({
    message: ADMIN_MESSAGES.REPORT_CONTENT_SUCCESS,
    result
  })
}

export const moderateContentController = async (req: Request<any, any, ModerateContentBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await contentModerationService.moderateContent(user_id, req.body)

  res.json({
    message: ADMIN_MESSAGES.MODERATE_CONTENT_SUCCESS,
    result
  })
}

export const getCommentsController = async (req: Request<any, any, any, ContentModerationQuery>, res: Response) => {
  const result = await contentModerationService.getComments(req.query)

  res.json({
    message: ADMIN_MESSAGES.GET_COMMENTS_SUCCESS,
    result
  })
}

export const removeCommentController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { comment_id, reason } = req.body

  const result = await contentModerationService.removeComment(comment_id, user_id, reason)

  res.json({
    message: ADMIN_MESSAGES.COMMENT_REMOVED_SUCCESS,
    result
  })
}

export const banUserController = async (req: Request<any, any, BanUserBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await contentModerationService.banUser(user_id, req.body)

  res.json({
    message: ADMIN_MESSAGES.USER_BANNED_SUCCESS,
    result
  })
}

export const unbanUserController = async (req: Request<any, any, UnbanUserBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await contentModerationService.unbanUser(user_id, req.body)

  res.json({
    message: ADMIN_MESSAGES.USER_UNBANNED_SUCCESS,
    result
  })
}

export const getUserBanHistoryController = async (req: Request<GetBanHistoryParams>, res: Response) => {
  const { user_id } = req.params
  const result = await contentModerationService.getUserBanHistory(user_id)

  res.json({
    message: ADMIN_MESSAGES.GET_BAN_HISTORY_SUCCESS,
    result
  })
}

export const getContentModerationStatsController = async (req: Request, res: Response) => {
  const result = await contentModerationService.getContentModerationStats()

  res.json({
    message: ADMIN_MESSAGES.GET_MODERATION_STATS_SUCCESS,
    result
  })
}

export const detectToxicContentController = async (req: Request, res: Response) => {
  const { content_id, content_type, text } = req.body

  const result = await contentModerationService.detectToxicContent(content_id, content_type, text)

  res.json({
    message: ADMIN_MESSAGES.TOXIC_CONTENT_DETECTION_SUCCESS,
    result
  })
}
