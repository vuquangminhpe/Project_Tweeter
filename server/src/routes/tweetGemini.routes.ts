import { Router } from 'express'
import { chatWithGeminiController, generateTweetTextGeminiController } from '~/controllers/tweet.controllers'
import { messageUploadValidator } from '~/middlewares/conversations.middlewares'
import { AccessTokenValidator, premiumUserValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const tweetGeminiRoutes = Router()

/**
 * Description: generate tweet with gemini (image)
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

export default tweetGeminiRoutes
