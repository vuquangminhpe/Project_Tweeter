import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/request/User.request'
import HTTP_STATUS from '~/constants/httpStatus'
import { AccountStatus } from '~/constants/enums'
import paymentService from '~/services/Payment.schema'
import { PAYMENT_MESSAGE } from '~/constants/messages'
import { CreatePaymentResBody } from '~/models/request/Payment.request'

export const createPaymentController = async (
  req: Request<ParamsDictionary, any, any, CreatePaymentResBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { subscription_type } = req.body

  if (!Object.values(AccountStatus).includes(subscription_type) || subscription_type === AccountStatus.FREE) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: PAYMENT_MESSAGE.INVALID_SUBSCRIPTION_TYPE
    })
  }

  const result = await paymentService.createVnpayPayment(user_id, subscription_type)

  if (result.success) {
    res.json({
      message: PAYMENT_MESSAGE.PAYMENT_SUCCESSFULLY,
      payUrl: result.payUrl,
      orderId: result.orderId
    })
  } else {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: PAYMENT_MESSAGE.PAYMENT_FAILED
    })
  }
}

export const paymentCallbackController = async (req: Request, res: Response) => {
  try {
    const data = req.query

    console.log('Payment callback received:', JSON.stringify(data))

    const result = await paymentService.verifyVnpayPayment(data)

    const redirectUrl = `${process.env.CLIENT_URL}/payment/result?orderId=${data.vnp_TxnRef}&status=${result.success ? 'SUCCESS' : 'FAILED'}`

    res.redirect(redirectUrl)
  } catch (error) {
    console.error('Payment callback error:', error)
    res.redirect(`${process.env.CLIENT_URL}/payment/result?status=ERROR`)
  }
}

export const paymentWebhookController = async (req: Request, res: Response) => {
  try {
    const data = req.query
    console.log('Payment webhook received:', JSON.stringify(data))

    const result = await paymentService.verifyVnpayPayment(data)
    if (result.success) {
      res.status(HTTP_STATUS.OK).json({
        RspCode: '00',
        Message: PAYMENT_MESSAGE.CONFIRM_SUCCESS
      })
    } else {
      res.status(HTTP_STATUS.OK).json({
        RspCode: '99',
        Message: PAYMENT_MESSAGE.PAYMENT_FAILED
      })
    }
  } catch (error) {
    console.error('Payment webhook error:', error)
    res.status(HTTP_STATUS.OK).json({
      RspCode: '99',
      Message: PAYMENT_MESSAGE.UNKNOW_ERROR
    })
  }
}

export const getPaymentStatusController = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params

    const payment = await paymentService.getPaymentHistory(req.decode_authorization?.user_id as string)
    const targetPayment = payment.find((p) => p.order_id === order_id)

    if (!targetPayment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: PAYMENT_MESSAGE.PAYMENT_NOT_FOUND
      })
    }

    res.json({
      status: targetPayment.status,
      orderId: targetPayment.order_id,
      amount: targetPayment.amount,
      subscriptionType: targetPayment.subscription_type,
      bankCode: targetPayment.bank_code,
      cardType: targetPayment.card_type,
      createdAt: targetPayment.created_at,
      updatedAt: targetPayment.updated_at
    })
  } catch (error) {
    console.error('Get payment status error:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: PAYMENT_MESSAGE.INTERNAL_SERVER_ERROR
    })
  }
}

export const getSubscriptionStatusController = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.decode_authorization as TokenPayload

    const result = await paymentService.checkSubscriptionStatus(user_id)

    res.json({
      ...result,
      subscriptionType: AccountStatus[result.subscriptionType]
    })
  } catch (error) {
    console.error('Get subscription status error:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: PAYMENT_MESSAGE.INTERNAL_SERVER_ERROR
    })
  }
}

export const getPricingInfoController = async (req: Request, res: Response) => {
  try {
    const result = await paymentService.getPricingInfo()

    const formattedPrices: Record<string, number> = {}
    Object.keys(result.prices).forEach((key) => {
      formattedPrices[AccountStatus[parseInt(key) as unknown as keyof typeof AccountStatus]] =
        result.prices[parseInt(key) as keyof typeof result.prices]
    })

    const formattedDuration: Record<string, number> = {}
    Object.keys(result.duration).forEach((key) => {
      formattedDuration[AccountStatus[parseInt(key) as unknown as keyof typeof AccountStatus]] =
        result.prices[parseInt(key) as keyof typeof result.prices]
    })

    res.json({
      prices: formattedPrices,
      duration: formattedDuration
    })
  } catch (error) {
    console.error('Get pricing info error:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: PAYMENT_MESSAGE.INTERNAL_SERVER_ERROR
    })
  }
}

export const getPaymentHistoryController = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.decode_authorization as TokenPayload

    const result = await paymentService.getPaymentHistory(user_id)

    const formattedPayments = result.map((payment) => ({
      id: payment._id?.toString(),
      orderId: payment.order_id,
      transactionId: payment.transaction_id,
      amount: payment.amount,
      subscriptionType: AccountStatus[payment.subscription_type],
      status: payment.status,
      bankCode: payment.bank_code,
      cardType: payment.card_type,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at
    }))

    res.json({
      payments: formattedPayments
    })
  } catch (error) {
    console.error('Get payment history error:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: PAYMENT_MESSAGE.INTERNAL_SERVER_ERROR
    })
  }
}
