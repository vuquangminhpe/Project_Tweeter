import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { AccountStatus } from '~/constants/enums'
import databaseService from './database.services'
import { envConfig } from '~/constants/config'
import moment from 'moment'

const PRICES = {
  [AccountStatus.PREMIUM]: 50000,
  [AccountStatus.PLATINUM]: 100000
}

const SUBSCRIPTION_DURATION = {
  [AccountStatus.PREMIUM]: 1,
  [AccountStatus.PLATINUM]: 1
}

class PaymentService {
  // Hàm sắp xếp object theo thứ tự alphabet (chính xác theo yêu cầu VNPAY)
  private sortObject(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj)
      .sort()
      .reduce((sorted: Record<string, any>, key) => {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
          sorted[key] = obj[key]
        }
        return sorted
      }, {})
  }

  // Hàm tạo chuỗi ký (chắc chắn đúng format)
  private createSignatureString(params: Record<string, any>): string {
    return Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join('&')
  }

  // Hàm tạo chữ ký HMAC-SHA512
  private generateHmacSignature(data: string, secret: string): string {
    return crypto.createHmac('sha512', secret).update(data, 'utf-8').digest('hex')
  }

  // Tạo thanh toán VNPAY
  async createVnpayPayment(user_id: string, subscription_type: AccountStatus) {
    try {
      if (subscription_type === AccountStatus.FREE) {
        throw new Error('Cannot create payment for free subscription')
      }

      const date = new Date()
      const amount = PRICES[subscription_type]
      const orderId = moment(date).format('YYYYMMDDHHmmss')

      // Lưu đơn hàng vào database
      await databaseService.payments.insertOne({
        user_id: new ObjectId(user_id),
        order_id: orderId,
        amount,
        subscription_type,
        status: 'PENDING',
        created_at: new Date()
      })

      // Lấy config VNPAY
      const { vnpay_tmn_code, vnpay_hash_secret, vnpay_url, vnpay_return_url } = envConfig

      // Format ngày giờ theo yêu cầu VNPAY
      const createDate = moment().format('YYYYMMDDHHmmss')

      // Tạo danh sách tham số
      const vnpParams: Record<string, any> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnpay_tmn_code,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanhtoan${orderId}`,
        vnp_OrderType: 'billpayment',
        vnp_Amount: parseInt((amount * 100).toFixed(0), 10), // Fix kiểu số
        vnp_ReturnUrl: vnpay_return_url,
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: createDate
      }
      console.log('Secret Key HEX:', Buffer.from(vnpay_hash_secret as string, 'utf-8').toString('hex'))

      const sortedParams = this.sortObject(vnpParams)

      console.log(
        'Encoded URL:',
        Object.entries(sortedParams)
          .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
          .join('&')
      )
      const signData = this.createSignatureString(sortedParams)
      const secureHash = this.generateHmacSignature(signData, vnpay_hash_secret as string)

      // Debug để kiểm tra lỗi sai chữ ký
      console.log('=== VNPAY PAYMENT DEBUG ===')
      console.log('Sorted Params:', JSON.stringify(sortedParams))
      console.log('Sign Data:', signData)
      console.log('Generated Signature:', secureHash)

      // Tạo URL thanh toán
      const paymentUrl =
        `${vnpay_url}?` +
        Object.entries(sortedParams)
          .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
          .join('&') +
        `&vnp_SecureHash=${secureHash}`

      return {
        success: true,
        payUrl: paymentUrl,
        orderId
      }
    } catch (error) {
      console.error('VNPAY payment creation error:', error)
      throw error
    }
  }

  // Xác thực thanh toán từ VNPAY
  async verifyVnpayPayment(queryParams: any) {
    try {
      console.log('=== VNPAY VERIFICATION ===')
      console.log('Received Params:', JSON.stringify(queryParams))

      // Lấy chữ ký từ query
      const secureHash = queryParams.vnp_SecureHash

      // Xóa các tham số không cần kiểm tra chữ ký
      const vnpParams = { ...queryParams }
      delete vnpParams.vnp_SecureHash
      delete vnpParams.vnp_SecureHashType

      // Sắp xếp tham số & tạo chữ ký kiểm tra
      const sortedParams = this.sortObject(vnpParams)
      const signData = this.createSignatureString(sortedParams)
      const calculatedHash = this.generateHmacSignature(signData, envConfig.vnpay_hash_secret as string)

      console.log('Calculated Signature:', calculatedHash)
      console.log('Received Signature:', secureHash)

      // Kiểm tra chữ ký
      if (secureHash !== calculatedHash) {
        console.error('Invalid VNPAY signature')
        await databaseService.payments.updateOne(
          { order_id: vnpParams.vnp_TxnRef },
          { $set: { status: 'FAILED', error: 'Invalid signature', updated_at: new Date() } }
        )
        return { success: false, message: 'Invalid signature' }
      }

      // Kiểm tra mã phản hồi từ VNPAY
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

      // Cập nhật trạng thái thanh toán
      await databaseService.payments.updateOne(
        { order_id: vnpParams.vnp_TxnRef },
        { $set: { status: 'SUCCESS', updated_at: new Date() } }
      )

      return { success: true, message: 'Payment successful' }
    } catch (error) {
      console.error('VNPAY payment verification error:', error)
      throw error
    }
  }

  // Keep existing methods
  async checkSubscriptionStatus(user_id: string) {
    // Existing implementation...
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
