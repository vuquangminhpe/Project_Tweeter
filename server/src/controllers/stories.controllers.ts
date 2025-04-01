import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '../constants/httpStatus'
import { STORIES_MESSAGE } from '../constants/messages'
import { ErrorWithStatus } from '../models/Errors'
import { createNewStoryResBody, ReactStoryResBody, viewAndStatusStoryResBody } from '../models/request/Stories.requests'
import { TokenPayload } from '../models/request/User.request'
import databaseService from '../services/database.services'
import storiesService from '../services/stories.services'
export const createNewStoryController = async (
  req: Request<ParamsDictionary, any, createNewStoryResBody, any>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await storiesService.createNewStory({ payload: req.body, user_id })
  res.json({
    message: STORIES_MESSAGE.CREATE_STORY_SUCCESS,
    result
  })
}
export const viewAndStatusStoryController = async (
  req: Request<ParamsDictionary, any, viewAndStatusStoryResBody, any>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const result = await storiesService.viewAndStatusStory({ payload: req.body, user_id })
  res.json({
    message: STORIES_MESSAGE.VIEW_AND_STATUS_STORY_SUCCESS,
    result
  })
}

export const updateStoryStoryController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await storiesService.updateStory({ payload: req.body, user_id })
  res.json({
    message: STORIES_MESSAGE.UPDATE_STORY_SUCCESS,
    result
  })
}
export const getNewsFeedStoriesController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page } = req.query
  console.log(page)

  const { result, total, totalPages } = await storiesService.getNewsFeedStories({
    user_id,
    limit: Number(limit),
    page: Number(page)
  })
  res.json({
    message: STORIES_MESSAGE.GET_NEWS_FEED_STORIES_SUCCESS,
    result,
    page: Number(page),
    total: Number(total),
    total_pages: Number(totalPages)
  })
}
export const getArchiveStoriesController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page } = req.query
  const { result, total } = await storiesService.getArchiveStories({
    user_id,
    limit: Number(limit),
    page: Number(page)
  })
  res.json({
    message: STORIES_MESSAGE.GET_ARCHIVE_STORIES_SUCCESS,
    result,
    page: Number(page),
    total_pages: Math.ceil(total / Number(limit))
  })
}

export const deleteStoryController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { story_id } = req.params

  const result = await storiesService.deleteStory({ user_id, story_id })
  res.json({
    message: STORIES_MESSAGE.DELETE_STORY_SUCCESS,
    result
  })
}
export const getStoryViewersController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { story_id } = req.params
  const result = await storiesService.getStoryViewers({
    user_id,
    story_id
  })
  res.json({
    message: STORIES_MESSAGE.GET_STORY_VIEWERS_SUCCESS,
    result
  })
}
export const reactStoryController = async (req: Request<ParamsDictionary, any, ReactStoryResBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { story_id } = req.params
  const { reaction_type } = req.body
  const result = await storiesService.reactStory({ user_id, story_id, reaction_type })
  res.json({
    message: STORIES_MESSAGE.REACT_STORY_SUCCESS,
    result
  })
}
export const replyStoryController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { story_id } = req.params
  const result = await storiesService.replyStory({ user_id, story_id, payload: req.body })
  res.json({
    message: STORIES_MESSAGE.REPLY_STORY_SUCCESS,
    result
  })
}

export const hideUserStoriesController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { target_user_id } = req.params
  const result = await storiesService.hideUserStories({ user_id, target_user_id })
  res.json({
    message: STORIES_MESSAGE.HIDE_USER_STORIES_SUCCESS,
    result
  })
}
