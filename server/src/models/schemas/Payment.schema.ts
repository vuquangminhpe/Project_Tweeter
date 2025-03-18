import { ObjectId } from 'mongodb'
import { AccountStatus } from '~/constants/enums'

type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'

interface PaymentType {
  _id?: ObjectId
  user_id: ObjectId
  order_id: string
  transaction_id?: string
  amount: number
  subscription_type: AccountStatus
  status: PaymentStatus
  error?: string
  bank_code?: string
  card_type?: string
  payment_method?: string
  created_at: Date
  updated_at?: Date
}

export class Payment {
  _id?: ObjectId
  user_id: ObjectId
  order_id: string
  transaction_id?: string
  amount: number
  subscription_type: AccountStatus
  status: PaymentStatus
  error?: string
  bank_code?: string
  card_type?: string
  payment_method?: string
  created_at: Date
  updated_at?: Date

  constructor({
    _id,
    user_id,
    order_id,
    transaction_id,
    amount,
    subscription_type,
    status,
    error,
    bank_code,
    card_type,
    payment_method,
    created_at,
    updated_at
  }: PaymentType) {
    this._id = _id
    this.user_id = user_id
    this.order_id = order_id
    this.transaction_id = transaction_id
    this.amount = amount
    this.subscription_type = subscription_type
    this.status = status
    this.error = error
    this.bank_code = bank_code
    this.card_type = card_type
    this.payment_method = payment_method
    this.created_at = created_at || new Date()
    this.updated_at = updated_at
  }
}
