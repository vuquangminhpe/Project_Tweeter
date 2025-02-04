import { Router } from 'express'
import { createNewStoryController } from '~/controllers/stories.controllers'
import { createNewStoryValidator } from '~/middlewares/stories.middleware'
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

export default storiesRouter
