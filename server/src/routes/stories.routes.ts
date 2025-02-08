import { Router } from 'express'
import {
  createNewStoryController,
  updateStoryStoryController,
  viewAndStatusStoryController
} from '~/controllers/stories.controllers'
import {
  createNewStoryValidator,
  updateStoryValidator,
  viewAndStatusStoryValidator
} from '~/middlewares/stories.middleware'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const storiesRouter = Router()

/**
 * Description: Create a new story(Upload a new story)
 * Path: /
 * Method: POST
 * Body: {content: string, media_url: string, media_type: string, caption: string, privacy: string[]}
 * header: {Authorization:Bearer <access_token> }
 */
storiesRouter.post(
  '/create-story',
  AccessTokenValidator,
  verifiedUserValidator,
  createNewStoryValidator,
  wrapAsync(createNewStoryController)
)

/**
 * Description: view and status story
 * Path: /view-and-status-story
 * Method: POST
 * Body: {content: string, view_status: string, story_id: string}
 * header: {Authorization:Bearer <access_token> }
 */
storiesRouter.post(
  '/view-and-status-story',
  AccessTokenValidator,
  verifiedUserValidator,
  viewAndStatusStoryValidator,
  wrapAsync(viewAndStatusStoryController)
)

/**
 * Description:update story
 * Path: /update-story
 * Method: POST
 * Body: {content: string, media_url: string, media_type: string, caption: string, privacy: string[]}
 * header: {Authorization:Bearer <access_token> }
 */
storiesRouter.post(
  '/update-story',
  AccessTokenValidator,
  verifiedUserValidator,
  updateStoryValidator,
  wrapAsync(updateStoryStoryController)
)

/**
 * Description:reaction story
 * Path: /reaction-story
 * Method: POST
 * Body: {content: string, media_url: string, media_type: string, caption: string, privacy: string[]}
 * header: {Authorization:Bearer <access_token> }
 */
export default storiesRouter
