import crypto from 'crypto'
import qs from 'qs'
import { AccountStatus } from '~/constants/enums'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import dayjs from 'dayjs'

const PRICES = {
  [AccountStatus.PREMIUM]: 50000,
  [AccountStatus.PLATINUM]: 100000
}

const SUBSCRIPTION_DURATION = {
  [AccountStatus.PREMIUM]: 1,
  [AccountStatus.PLATINUM]: 1
}

class PaymentService {
  private createVnpaySignature(data: string, secretKey: string): string {
    return crypto.createHmac('sha512', secretKey).update(data).digest('hex')
  }

  private generateRandomOrderId(): string {
    return `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  }

  async createVnpayPayment(user_id: string, subscription_type: AccountStatus) {
    try {
      if (subscription_type === AccountStatus.FREE) {
        throw new Error('Cannot create payment for free subscription')
      }

      const amount = PRICES[subscription_type]
      const orderId = this.generateRandomOrderId()

      await databaseService.payments.insertOne({
        user_id: new ObjectId(user_id),
        order_id: orderId,
        amount,
        subscription_type,
        status: 'PENDING',
        created_at: new Date()
      })

      const tmnCode = envConfig.vnpay_tmn_code
      const secretKey = envConfig.vnpay_hash_secret
      const returnUrl = envConfig.vnpay_return_url

      const date = new Date()
      const createDate = dayjs(date).format('YYYYMMDDHHmmss')

      const extraData = Buffer.from(
        JSON.stringify({
          user_id,
          subscription_type
        })
      ).toString('base64')

      const orderInfo = `Thanh toan don hang: ${orderId}`
      const orderType = 'billpayment'
      const locale = 'vn'
      const currCode = 'VND'

      let vnpParams: Record<string, string | number> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode as string,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl as string,
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: createDate,
        vnp_ExpireDate: dayjs(date).add(15, 'minute').format('YYYYMMDDHHmmss'), // Payment expires in 15 minutes
        vnp_BankCode: '',
        vnp_Inv_Email: 'customer@email.com',
        vnp_Inv_Phone: '0123456789',
        vnp_Inv_Type: 'billpayment',
        vnp_Inv_Company: 'Your Company',
        vnp_Inv_TaxCode: '0123456789',
        vnp_Inv_Customer: 'Customer',
        vnp_Inv_Address: 'Address',
        vnp_Inv_Description: `Subscribe to ${AccountStatus[subscription_type]} plan`
      }

      const sortedParams = this.sortObject(vnpParams)
      const signData = qs.stringify(sortedParams, { encode: false })
      const hmac = this.createVnpaySignature(signData, secretKey as string)

      const vnpUrl = `${envConfig.vnpay_url}?${signData}&vnp_SecureHash=${hmac}`

      return {
        success: true,
        payUrl: vnpUrl,
        orderId
      }
    } catch (error) {
      console.error('Create VNPAY payment error:', error)
      throw error
    }
  }
  private sortObject(obj: Record<string, any>): Record<string, any> {
    const sorted: Record<string, any> = {}
    const keys = Object.keys(obj).sort()

    for (const key of keys) {
      if (obj[key] !== null && obj[key] !== undefined) {
        sorted[key] = obj[key]
      }
    }

    return sorted
  }

  async verifyVnpayPayment(data: any) {
    try {
      const vnp_SecureHash = data.vnp_SecureHash
      delete data.vnp_SecureHash
      delete data.vnp_SecureHashType
      const sortedData = this.sortObject(data)

      const signData = qs.stringify(sortedData, { encode: false })
      const hmac = this.createVnpaySignature(signData, envConfig.vnpay_hash_secret as string)

      if (hmac !== vnp_SecureHash) {
        throw new Error('Invalid signature')
      }

      if (data.vnp_ResponseCode !== '00' || data.vnp_TransactionStatus !== '00') {
        await databaseService.payments.updateOne(
          { order_id: data.vnp_TxnRef },
          {
            $set: {
              status: 'FAILED',
              error: `Payment failed with code: ${data.vnp_ResponseCode}`,
              transaction_id: data.vnp_TransactionNo,
              updated_at: new Date()
            }
          }
        )
        return {
          success: false,
          message: `Payment failed with code: ${data.vnp_ResponseCode}`
        }
      }

      const payment = await databaseService.payments.findOne({ order_id: data.vnp_TxnRef })
      if (!payment) {
        throw new Error('Payment not found')
      }

      await databaseService.payments.updateOne(
        { order_id: data.vnp_TxnRef },
        {
          $set: {
            status: 'SUCCESS',
            transaction_id: data.vnp_TransactionNo,
            bank_code: data.vnp_BankCode,
            card_type: data.vnp_CardType,
            updated_at: new Date()
          }
        }
      )

      const now = new Date()
      const subscriptionEndDate = new Date(now)
      subscriptionEndDate.setMonth(
        now.getMonth() + SUBSCRIPTION_DURATION[payment.subscription_type as keyof typeof SUBSCRIPTION_DURATION]
      )

      await databaseService.users.updateOne(
        { _id: payment.user_id },
        {
          $set: {
            typeAccount: payment.subscription_type,
            count_type_account: 0,
            subscription_end_date: subscriptionEndDate,
            updated_at: new Date()
          }
        }
      )

      return {
        success: true,
        message: 'Payment successful'
      }
    } catch (error) {
      console.error('Verify VNPAY payment error:', error)
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
      console.error('Check subscription status error:', error)
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
      console.error('Get payment history error:', error)
      throw error
    }
  }
}

const paymentService = new PaymentService()
export default paymentService
