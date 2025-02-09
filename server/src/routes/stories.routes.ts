import { Router } from 'express'
import {
  createNewStoryController,
  getArchiveStoriesController,
  getNewsFeedStoriesController,
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
 * Description: Get stories of user and friends
 * Path: /get-news-feed-stories
 * Method: GET
 * Query: {page: number, limit: number}
 * header: {Authorization:Bearer <access_token>}
 */
storiesRouter.get(
  '/get-news-feed-stories',
  AccessTokenValidator,
  verifiedUserValidator,
  wrapAsync(getNewsFeedStoriesController)
)

/**
 * Description: Get stories archive of current user
 * Path: /get-archive-stories
 * Method: GET
 * Query: {page: number, limit: number}
 * header: {Authorization:Bearer <access_token>}
 */
storiesRouter.get(
  '/get-archive-stories',
  AccessTokenValidator,
  verifiedUserValidator,
  wrapAsync(getArchiveStoriesController)
)

/**
 * Description: Delete a story
 * Path: /delete-story/:story_id
 * Method: DELETE
 * header: {Authorization:Bearer <access_token>}
 */
storiesRouter.delete(
  '/delete-story/:story_id',
  AccessTokenValidator,
  verifiedUserValidator
  // wrapAsync(deleteStoryController)
)

/**
 * Description: Get story viewers
 * Path: /get-story-viewers/:story_id
 * Method: GET
 * Query: {page: number, limit: number}
 * header: {Authorization:Bearer <access_token>}
 */
storiesRouter.get(
  '/get-story-viewers/:story_id',
  AccessTokenValidator,
  verifiedUserValidator
  // wrapAsync(getStoryViewersController)
)

/**
 * Description: Share story to news feed
 * Path: /share-story-to-newsfeed/:story_id
 * Method: POST
 * Body: {caption: string}
 * header: {Authorization:Bearer <access_token>}
 */
storiesRouter.post(
  '/share-story-to-newsfeed/:story_id',
  AccessTokenValidator,
  verifiedUserValidator
  // wrapAsync(shareStoryToNewsFeedController)
)

/**
 * Description: Mute stories from a user
 * Path: /mute-user-stories/:user_id
 * Method: POST
 * header: {Authorization:Bearer <access_token>}
 */
storiesRouter.post(
  '/mute-user-stories/:user_id',
  AccessTokenValidator,
  verifiedUserValidator
  // wrapAsync(muteUserStoriesController)
)

/**
 * Description: Get muted stories users
 * Path: /get-muted-stories-users
 * Method: GET
 * Query: {page: number, limit: number}
 * header: {Authorization:Bearer <access_token>}
 */
storiesRouter.get(
  '/get-muted-stories-users',
  AccessTokenValidator,
  verifiedUserValidator
  // wrapAsync(getMutedStoriesUsersController)
)
export default storiesRouter
