import { Router } from 'express'
import { getConversationsByReceiverIdController } from '~/controllers/conversations.controllers'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const conversationsRouter = Router()

conversationsRouter.get(
  '/receivers/:receiver_id',
  AccessTokenValidator,
  verifiedUserValidator,
  getConversationsByReceiverIdController
)

export default conversationsRouter
