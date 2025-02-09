import { ObjectId } from 'bson'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { STORIES_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { createNewStoryResBody, viewAndStatusStoryResBody } from '~/models/request/Stories.requests'
import { TokenPayload } from '~/models/request/User.request'
import databaseService from '~/services/database.services'
import storiesService from '~/services/stories.services'
export const createNewStoryController = async (
  req: Request<ParamsDictionary, any, createNewStoryResBody, any>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await storiesService.createNewStory({ payload: req.body, user_id })
  res.json({
    message: STORIES_MESSAGE.CREATE_STORY_SUCCESS
  })
}
export const viewAndStatusStoryController = async (
  req: Request<ParamsDictionary, any, viewAndStatusStoryResBody, any>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const checkUser = await databaseService.stories.findOne({ user_id: new ObjectId(user_id) })
  if (checkUser) {
    throw new ErrorWithStatus({
      message: STORIES_MESSAGE.CANNOT_VIEW_AND_STATUS_YOURSELF_STORY,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
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
  const { result, total } = await storiesService.getNewsFeedStories({
    user_id,
    limit: Number(limit),
    page: Number(page)
  })
  res.json({
    message: STORIES_MESSAGE.GET_NEWS_FEED_STORIES_SUCCESS,
    result,
    page: Number(page),
    total_pages: Math.ceil(total / Number(limit))
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
