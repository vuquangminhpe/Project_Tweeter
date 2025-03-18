import { Router } from 'express'
import {
  createPaymentController,
  getPaymentHistoryController,
  getPaymentStatusController,
  getPricingInfoController,
  getSubscriptionStatusController,
  paymentCallbackController,
  paymentWebhookController
} from '~/controllers/payments.controllers'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const paymentRouter = Router()

/**
 * Description: Create a new payment
 * Path: /
 * Method: POST
 * Body: { subscription_type: number }
 * Header: { Authorization: Bearer <access_token> }
 */
paymentRouter.post('/', AccessTokenValidator, verifiedUserValidator, wrapAsync(createPaymentController))

/**
 * Description: VNPAY callback after payment
 * Path: /callback
 * Method: GET
 * Query: VNPAY params
 */
paymentRouter.get('/callback', wrapAsync(paymentCallbackController))

/**
 * Description: Payment webhook from VNPAY
 * Path: /webhook
 * Method: GET
 * Query: VNPAY IPN params
 */
paymentRouter.get('/webhook', wrapAsync(paymentWebhookController))

/**
 * Description: Get payment status by order_id
 * Path: /:order_id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
paymentRouter.get('/:order_id', AccessTokenValidator, verifiedUserValidator, wrapAsync(getPaymentStatusController))

/**
 * Description: Get current user subscription status
 * Path: /subscription/status
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
paymentRouter.get(
  '/subscription/status',
  AccessTokenValidator,
  verifiedUserValidator,
  wrapAsync(getSubscriptionStatusController)
)

/**
 * Description: Get pricing information
 * Path: /pricing
 * Method: GET
 */
paymentRouter.get('/pricing', wrapAsync(getPricingInfoController))

/**
 * Description: Get payment history
 * Path: /history
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
paymentRouter.get('/history', AccessTokenValidator, verifiedUserValidator, wrapAsync(getPaymentHistoryController))

export default paymentRouter
