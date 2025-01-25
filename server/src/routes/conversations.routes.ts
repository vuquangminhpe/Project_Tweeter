import { Router } from 'express'
import {
  getAllConverSationsController,
  getConversationsByReceiverIdController
} from '~/controllers/conversations.controllers'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
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
 * Description: edit conversation
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
 * Description: edit conversation
 * Path: /conversation/:messages_id
 * Method: PUT
 * header: {Authorization:Bearer <access_token> }
 */
conversationsRouter.put('/conversation/:messages_id', AccessTokenValidator, verifiedUserValidator)
export default conversationsRouter
