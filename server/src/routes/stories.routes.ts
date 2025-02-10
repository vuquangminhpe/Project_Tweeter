import { Router } from 'express'
import {
  createNewStoryController,
  deleteStoryController,
  getArchiveStoriesController,
  getNewsFeedStoriesController,
  getStoryViewersController,
  reactStoryController,
  updateStoryStoryController,
  viewAndStatusStoryController
} from '~/controllers/stories.controllers'
import {
  createNewStoryValidator,
  reactStoryValidator,
  replyStoryValidator,
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
  verifiedUserValidator,
  wrapAsync(deleteStoryController)
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
  verifiedUserValidator,
  wrapAsync(getStoryViewersController)
)

/**
 * Description: React to a story
 * Path: /react-story/:story_id
 * Method: POST
 * Body: {reaction_type: string}
 * header: {Authorization: Bearer <access_token>}
 */
storiesRouter.post(
  '/react-story/:story_id',
  AccessTokenValidator,
  verifiedUserValidator,
  reactStoryValidator,
  wrapAsync(reactStoryController)
)

/**
 * Description: Reply to a story
 * Path: /reply-story/:story_id
 * Method: POST
 * Body: {content: string, media_url?: string, media_type?: string}
 * header: {Authorization: Bearer <access_token>}
 */
// storiesRouter.post(
//   '/reply-story/:story_id',
//   AccessTokenValidator,
//   verifiedUserValidator,
//   replyStoryValidator,
//   wrapAsync(replyStoryController)
// )

// /**
//  * Description: Hide stories from a specific user
//  * Path: /hide-user-stories/:user_id
//  * Method: POST
//  * Body: {duration?: string}
//  * header: {Authorization: Bearer <access_token>}
//  */
// storiesRouter.post(
//   '/hide-user-stories/:user_id',
//   AccessTokenValidator,
//   verifiedUserValidator,
//   hideUserStoriesValidator,
//   wrapAsync(hideUserStoriesController)
// )

// /**
//  * Description: Toggle story notifications for a user
//  * Path: /toggle-story-notifications/:user_id
//  * Method: POST
//  * Body: {enabled: boolean}
//  * header: {Authorization: Bearer <access_token>}
//  */
// storiesRouter.post(
//   '/toggle-story-notifications/:user_id',
//   AccessTokenValidator,
//   verifiedUserValidator,
//   toggleNotificationsValidator,
//   wrapAsync(toggleStoryNotificationsController)
// )

// /**
//  * Description: Mute/unmute stories from a user
//  * Path: /mute-user-stories/:user_id
//  * Method: POST
//  * Body: {muted: boolean, duration?: string}
//  * header: {Authorization: Bearer <access_token>}
//  */
// storiesRouter.post(
//   '/mute-user-stories/:user_id',
//   AccessTokenValidator,
//   verifiedUserValidator,
//   muteUserStoriesValidator,
//   wrapAsync(muteUserStoriesController)
// )

// /**
//  * Description: Add story to highlights
//  * Path: /add-to-highlights/:story_id
//  * Method: POST
//  * Body: {highlight_name: string, cover_image?: string}
//  * header: {Authorization: Bearer <access_token>}
//  */
// storiesRouter.post(
//   '/add-to-highlights/:story_id',
//   AccessTokenValidator,
//   verifiedUserValidator,
//   addToHighlightsValidator,
//   wrapAsync(addToHighlightsController)
// )

// /**
//  * Description: Remove story from highlights
//  * Path: /remove-from-highlights/:story_id
//  * Method: DELETE
//  * header: {Authorization: Bearer <access_token>}
//  */
// storiesRouter.delete(
//   '/remove-from-highlights/:story_id',
//   AccessTokenValidator,
//   verifiedUserValidator,
//   wrapAsync(removeFromHighlightsController)
// )

// /**
//  * Description: Get user's story highlights
//  * Path: /get-highlights
//  * Method: GET
//  * Query: {page: number, limit: number}
//  * header: {Authorization: Bearer <access_token>}
//  */
// storiesRouter.get('/get-highlights', AccessTokenValidator, verifiedUserValidator, wrapAsync(getHighlightsController))

// /**
//  * Description: Update story settings
//  * Path: /update-story-settings
//  * Method: PUT
//  * Body: {default_privacy: string[], reply_privacy: string, allow_reshare: boolean}
//  * header: {Authorization: Bearer <access_token>}
//  */
// storiesRouter.put(
//   '/update-story-settings',
//   AccessTokenValidator,
//   verifiedUserValidator,
//   updateStorySettingsValidator,
//   wrapAsync(updateStorySettingsController)
// )

// /**
//  * Description: Get story settings
//  * Path: /get-story-settings
//  * Method: GET
//  * header: {Authorization: Bearer <access_token>}
//  */
// storiesRouter.get(
//   '/get-story-settings',
//   AccessTokenValidator,
//   verifiedUserValidator,
//   wrapAsync(getStorySettingsController)
// )

// /**
//  * Description: Share story with friends
//  * Path: /share-story/:story_id
//  * Method: POST
//  * Body: {user_ids: string[], message?: string}
//  * header: {Authorization: Bearer <access_token>}
//  */
// storiesRouter.post(
//   '/share-story/:story_id',
//   AccessTokenValidator,
//   verifiedUserValidator,
//   shareStoryValidator,
//   wrapAsync(shareStoryController)
// )

// /**
//  * Description: Forward story to other users
//  * Path: /forward-story/:story_id
//  * Method: POST
//  * Body: {user_ids: string[], message?: string}
//  * header: {Authorization: Bearer <access_token>}
//  */
// storiesRouter.post(
//   '/forward-story/:story_id',
//   AccessTokenValidator,
//   verifiedUserValidator,
//   forwardStoryValidator,
//   wrapAsync(forwardStoryController)
// )
export default storiesRouter
