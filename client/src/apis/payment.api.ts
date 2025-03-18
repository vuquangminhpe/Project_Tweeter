import {
  CreatePaymentResponse,
  PaymentDetail,
  PaymentHistoryItem,
  PaymentHistoryParams,
  PaymentParams,
  PricingInfo,
  SubscriptionStatus
} from '@/types/Payment.types'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const apiPayment = {
  createPayment: (params: PaymentParams) => http.post<SuccessResponse<CreatePaymentResponse>>('/payments', params),

  getPaymentStatus: (orderId: string) => http.get<SuccessResponse<PaymentDetail>>(`/payments/${orderId}`),

  getSubscriptionStatus: () => http.get<SuccessResponse<SubscriptionStatus>>('/payments/subscription/status'),

  getPricingInfo: () => http.get<SuccessResponse<PricingInfo>>('/payments/pricing'),

  getPaymentHistory: (params?: PaymentHistoryParams) =>
    http.get<SuccessResponse<{ payments: PaymentHistoryItem[] }>>('/payments/history', {
      params
    })
}

export default apiPayment
