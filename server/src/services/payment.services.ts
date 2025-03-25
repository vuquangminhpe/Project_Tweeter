import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { AccountStatus } from '~/constants/enums'
import databaseService from './database.services'
import { envConfig } from '~/constants/config'
import moment from 'moment'
import qs from 'qs'
import { ErrorWithStatus } from '~/models/Errors'
import { PAYMENT_MESSAGE } from '~/constants/messages'
import { Request } from 'express'
const PRICES = {
  [AccountStatus.PREMIUM]: 50000,
  [AccountStatus.PLATINUM]: 100000
}

const SUBSCRIPTION_DURATION = {
  [AccountStatus.PREMIUM]: 1,
  [AccountStatus.PLATINUM]: 1
}

class PaymentService {
  private sortObject(obj: Record<string, any>) {
    let sorted: Record<string, any> = {}
    let str: string[] = []
    let key: string | number

    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key))
      }
    }

    str.sort()

    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
    }

    return sorted
  }

  async createVnpayPayment(user_id: string, subscription_type: AccountStatus) {
    try {
      if (subscription_type === AccountStatus.FREE) {
        throw new ErrorWithStatus({
          message: PAYMENT_MESSAGE.CANNOT_CREATE_FREE_PAYMENT,
          status: 400
        })
      }
      process.env.TZ = 'Asia/Ho_Chi_Minh'

      const date = new Date()
      const amount = PRICES[subscription_type]
      const orderId = moment(date).format('DDHHmmss')

      await databaseService.payments.insertOne({
        user_id: new ObjectId(user_id),
        order_id: orderId,
        amount,
        subscription_type,
        status: 'PENDING',
        created_at: new Date()
      })

      const { vnpay_tmn_code, vnpay_hash_secret, vnpay_url, vnpay_return_url } = envConfig

      const createDate = moment(date).format('YYYYMMDDHHmmss')

      const ipAddr = '127.0.0.1'

      const vnpParams: Record<string, any> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnpay_tmn_code,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: 'Thanh toan cho ma GD:' + orderId,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: vnpay_return_url,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
      }

      const sortedParams = this.sortObject(vnpParams)

      const signData = qs.stringify(sortedParams, { encode: false })

      const hmac = crypto.createHmac('sha512', vnpay_hash_secret as string)
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

      const vnpUrl = vnpay_url + '?' + signData + '&vnp_SecureHash=' + signed

      return {
        success: true,
        payUrl: vnpUrl,
        orderId
      }
    } catch (error) {
      throw error
    }
  }

  async verifyVnpayPayment(queryParams: any, req: Request) {
    try {
      const secureHash = queryParams.vnp_SecureHash

      const vnpParams = { ...queryParams }
      delete vnpParams.vnp_SecureHash
      delete vnpParams.vnp_SecureHashType

      const sortedParams = this.sortObject(vnpParams)
      const signData = qs.stringify(sortedParams, { encode: false })
      const hmac = crypto.createHmac('sha512', envConfig.vnpay_hash_secret as string)
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

      if (secureHash !== signed) {
        await databaseService.payments.updateOne(
          { order_id: vnpParams.vnp_TxnRef },
          { $set: { status: 'FAILED', error: 'Invalid signature', updated_at: new Date() } }
        )

        return { success: false, message: 'Invalid signature' }
      }

      if (vnpParams.vnp_ResponseCode !== '00') {
        await databaseService.payments.updateOne(
          { order_id: vnpParams.vnp_TxnRef },
          {
            $set: {
              status: 'FAILED',
              error: `Payment failed with code: ${vnpParams.vnp_ResponseCode}`,
              updated_at: new Date()
            }
          }
        )
        return { success: false, message: `Payment failed with code: ${vnpParams.vnp_ResponseCode}` }
      }

      await databaseService.payments.updateOne(
        { order_id: vnpParams.vnp_TxnRef },
        { $set: { status: 'SUCCESS', updated_at: new Date() } }
      )
      const amount = vnpParams.vnp_Amount
      console.log(amount, vnpParams)

      const user_id = req.decode_authorization?.user_id

      await databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            typeAccount: 2,
            subscription_end_date: moment().add(SUBSCRIPTION_DURATION[AccountStatus.PLATINUM], 'months').toDate(),
            updated_at: new Date()
          }
        }
      )

      return { success: true, message: 'Payment successful' }
    } catch (error) {
      throw error
    }
  }

  async checkSubscriptionStatus(user_id: string) {
    try {
      const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
      if (!user) {
        throw new Error('User not found')
      }

      if (user.subscription_end_date && new Date(user.subscription_end_date) > new Date()) {
        return {
          isActive: true,
          subscriptionType: user.typeAccount,
          expiryDate: user.subscription_end_date
        }
      }

      if (
        user.typeAccount !== AccountStatus.FREE &&
        user.subscription_end_date &&
        new Date(user.subscription_end_date) <= new Date()
      ) {
        await databaseService.users.updateOne(
          { _id: new ObjectId(user_id) },
          {
            $set: {
              typeAccount: AccountStatus.FREE,
              updated_at: new Date()
            }
          }
        )
      }

      return {
        isActive: false,
        subscriptionType: AccountStatus.FREE,
        expiryDate: null
      }
    } catch (error) {
      throw error
    }
  }

  async getPricingInfo() {
    return {
      prices: PRICES,
      duration: SUBSCRIPTION_DURATION
    }
  }

  async getPaymentHistory(user_id: string) {
    try {
      const payments = await databaseService.payments
        .find({ user_id: new ObjectId(user_id) })
        .sort({ created_at: -1 })
        .toArray()

      return payments
    } catch (error) {
      throw error
    }
  }
}

const paymentService = new PaymentService()
export default paymentService
