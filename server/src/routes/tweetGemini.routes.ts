import { Router } from 'express'
import {
  chatWithGeminiController,
  generateTweetTextGeminiController,
  getConversationInAIControllers
} from '~/controllers/tweet.controllers'
import { messageUploadValidator } from '~/middlewares/conversations.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { AccessTokenValidator, premiumUserValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const tweetGeminiRoutes = Router()

/**
 * Description: generate tweet with gemini (text)
 * Path: /generate/text
 * Method: POST
 * header: {Authorization:Bearer <access_token> }
 * body: message
 */
tweetGeminiRoutes.post(
  '/generate/text',
  AccessTokenValidator,
  verifiedUserValidator,
  premiumUserValidator,
  messageUploadValidator,
  wrapAsync(generateTweetTextGeminiController)
)

//  * Description: chat with gemini (text)
//  * Path: /generate/chat
//  * Method: POST
//  * body: {message: string}
//  * header: {Authorization:Bearer <access_token> }

tweetGeminiRoutes.post(
  '/generate/chat',
  AccessTokenValidator,
  verifiedUserValidator,
  premiumUserValidator,
  messageUploadValidator,
  wrapAsync(chatWithGeminiController)
)

//  * Description: get with gemini
//  * Path: /conversation/chat
//  * Method: GET
//  * header: {Authorization:Bearer <access_token> }
tweetGeminiRoutes.get(
  '/conversation/chat',
  AccessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapAsync(getConversationInAIControllers)
)
export default tweetGeminiRoutes
