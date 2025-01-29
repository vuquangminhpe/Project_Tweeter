import { Router } from 'express'
import {
  deleteMessageInConversationController,
  editMessageInConversationController,
  getAllConverSationsController,
  getConversationsByReceiverIdController
} from '~/controllers/conversations.controllers'
import {
  deleteMessageValidator,
  editMessageValidator,
  paginationValidator,
  premiumUserValidator
} from '~/middlewares/tweets.middlewares'
import { AccessTokenValidator, getConversationsValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

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
 * Path: /conversation/message/:messages_id
 * Method: PUT
 * header: {Authorization:Bearer <access_token> }
 */
conversationsRouter.put(
  '/conversation/message/:messages_id',
  AccessTokenValidator,
  verifiedUserValidator,
  editMessageValidator,
  wrapAsync(editMessageInConversationController)
)

/**
 * Description: delete message in conversation
 * Path: /conversation/message/:messages_id
 * Method: DELETE
 * header: {Authorization:Bearer <access_token> }
 */
conversationsRouter.delete(
  '/conversation/message/:messages_id',
  AccessTokenValidator,
  verifiedUserValidator,
  deleteMessageValidator,
  wrapAsync(deleteMessageInConversationController)
)
export default conversationsRouter
