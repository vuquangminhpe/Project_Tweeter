import { Router } from 'express'
import {
  deleteAllMessageInConversationController,
  deleteMessageInConversationController,
  editMessageInConversationController,
  getAllConverSationsController,
  getConversationsByReceiverIdController,
  setEmojiMessageInConversationController
} from '../controllers/conversations.controllers'
import {
  deleteAllMessageInConversationValidator,
  deleteMessageValidator,
  editMessageValidator
} from '../middlewares/conversations.middlewares'
import { paginationValidator } from '../middlewares/tweets.middlewares'
import {
  AccessTokenValidator,
  getConversationsValidator,
  verifiedUserValidator
} from '../middlewares/users.middlewares'
import { wrapAsync } from '../utils/handler'

const conversationsRouter = Router()

/**
 * Description: get receive
 * Path: /receivers/:receiver_id
 * Method: get
 * params: {limit: number, page: number}
 * header: {Authorization:Bearer <access_token> }
 */
conversationsRouter.get(
  '/receivers/:receiver_id',
  AccessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationsValidator,
  wrapAsync(getConversationsByReceiverIdController)
)

/**
 * Description:get all conversation
 * Path: /all_conversation
 * Method: GET
 * header: {Authorization:Bearer <access_token> }
 */
conversationsRouter.get(
  '/all_conversation',
  AccessTokenValidator,
  verifiedUserValidator,
  wrapAsync(getAllConverSationsController)
)

/**
 * Description: edit message in conversation
 * Path: /message/:messages_id
 * Method: PUT
 * header: {Authorization:Bearer <access_token> }
 * body: {content: string}
 */
conversationsRouter.put(
  '/message/:messages_id',
  AccessTokenValidator,
  verifiedUserValidator,
  editMessageValidator,
  wrapAsync(editMessageInConversationController)
)

/**
 * Description: set emoji message in conversation
 * Path: /message/emoji/:messages_id
 * Method: post
 * header: {Authorization:Bearer <access_token> }
 */
conversationsRouter.post(
  '/message/emoji/:messages_id',
  AccessTokenValidator,
  verifiedUserValidator,
  deleteMessageValidator,
  wrapAsync(setEmojiMessageInConversationController)
)

/**
 * Description: delete message in conversation
 * Path: /message/:messages_id
 * Method: DELETE
 * header: {Authorization:Bearer <access_token> }
 */
conversationsRouter.delete(
  '/message/:messages_id',
  AccessTokenValidator,
  verifiedUserValidator,
  deleteMessageValidator,
  wrapAsync(deleteMessageInConversationController)
)

/**
 * Description: delete all message in conversation
 * Path: /message/:messages_id
 * Method: DELETE
 * header: {Authorization:Bearer <access_token> }
 */
conversationsRouter.delete(
  '/message/:receive_id',
  AccessTokenValidator,
  verifiedUserValidator,
  deleteAllMessageInConversationValidator,
  wrapAsync(deleteAllMessageInConversationController)
)
export default conversationsRouter
