import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiPayment from '@/apis/payment.api'
import { PricingInfo, SubscriptionStatus } from '@/types/Payment.types'
import { CheckCircle, XCircle } from 'lucide-react'

const paymentOptions = [
  {
    id: 'VNPAYQR',
    name: 'VNPAY QR',
    logo: 'https://sandbox.vnpayment.vn/paymentv2/images/imgs/vnpay-logo.svg'
  },
  {
    id: 'VNBANK',
    name: 'Local ATM Card',
    logo: 'https://sandbox.vnpayment.vn/paymentv2/images/imgs/atm_card.svg'
  },
  {
    id: 'INTCARD',
    name: 'Visa/Mastercard/JCB',
    logo: 'https://sandbox.vnpayment.vn/paymentv2/images/imgs/visa-mastercard-jcb.svg'
  }
]

const defaultPricing: PricingInfo = {
  prices: {
    PREMIUM: 50000,
    PLATINUM: 100000
  },
  duration: {
    PREMIUM: 1,
    PLATINUM: 1
  }
}

const subscriptionFeatures = {
  PREMIUM: ['AI-Generated Tweets', 'Premium Chat Features', '20 AI Credits per month', 'Standard response time'],
  PLATINUM: [
    'All Premium Features',
    'Unlimited AI Credits',
    'Priority Support',
    'Ad-free experience',
    'Custom AI personalization'
  ]
}

const SubscriptionPage = () => {
  const [error, setError] = useState<string>('')

  const { data: pricingData, isLoading: isPricingLoading } = useQuery({
    queryKey: ['pricing-info'],
    queryFn: async () => {
      const response = await apiPayment.getPricingInfo()
      return response.data.data
    }
  })

  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const response = await apiPayment.getSubscriptionStatus()
      return response.data.data
    }
  })

  const createPaymentMutation = useMutation({
    mutationFn: (subscription_type: number) => apiPayment.createPayment({ subscription_type }),
    onSuccess: (response) => {
      window.location.href = response.data.data.payUrl
    },
    onError: (error) => {
      setError('Failed to initiate payment process. Please try again.')
      console.error('Payment creation error:', error)
    }
  })

  const handleSubscribe = (subscriptionType: string) => {
    const type = subscriptionType === 'PREMIUM' ? 1 : 2
    createPaymentMutation.mutate(type)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const pricing = pricingData || defaultPricing

  const subscription: SubscriptionStatus = subscriptionData || {
    isActive: false,
    subscriptionType: 'FREE',
    expiryDate: null
  }

  if (isPricingLoading || isSubscriptionLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='max-w-6xl mx-auto py-12 px-4'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900'>Upgrade Your Experience</h2>
          <p className='mt-4 text-xl text-gray-600'>Choose the plan that's right for you</p>
        </div>

        {subscription.isActive && (
          <div className='mt-8 max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden'>
            <div className='px-6 py-4'>
              <div className='font-bold text-xl mb-2 flex items-center'>
                <CheckCircle className='h-5 w-5 text-green-500 mr-2' />
                Current Subscription: {subscription.subscriptionType}
              </div>
              <p className='text-gray-700 text-base'>
                Your subscription is active until {new Date(subscription.expiryDate as string).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className='mt-8 max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex'>
              <XCircle className='h-5 w-5 text-red-500 mr-2' />
              <p className='text-red-700'>{error}</p>
            </div>
          </div>
        )}

        <div className='mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8'>
          <div className='relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col'>
            <div className='flex-1'>
              <h3 className='text-xl font-semibold text-gray-900'>Premium</h3>
              <p className='mt-4 flex items-baseline text-gray-900'>
                <span className='text-4xl font-extrabold tracking-tight'>{formatCurrency(pricing.prices.PREMIUM)}</span>
                <span className='ml-1 text-xl font-semibold'>/month</span>
              </p>
              <p className='mt-6 text-gray-500'>Perfect for casual users who want enhanced features</p>

              <ul className='mt-6 space-y-4'>
                {subscriptionFeatures.PREMIUM.map((feature, index) => (
                  <li key={index} className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <CheckCircle className='h-5 w-5 text-green-500' />
                    </div>
                    <p className='ml-3 text-sm text-gray-700'>{feature}</p>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('PREMIUM')}
              disabled={
                createPaymentMutation.isPending ||
                (subscription.isActive && subscription.subscriptionType === 'PREMIUM')
              }
              className='mt-8 block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {createPaymentMutation.isPending
                ? 'Processing...'
                : subscription.isActive && subscription.subscriptionType === 'PREMIUM'
                  ? 'Current Plan'
                  : 'Subscribe to Premium'}
            </button>
          </div>

          <div className='relative p-8 bg-gray-900 border border-gray-700 rounded-2xl shadow-sm flex flex-col'>
            <div className='flex-1'>
              <h3 className='text-xl font-semibold text-white'>Platinum</h3>
              <p className='mt-4 flex items-baseline text-white'>
                <span className='text-4xl font-extrabold tracking-tight'>
                  {formatCurrency(pricing.prices.PLATINUM)}
                </span>
                <span className='ml-1 text-xl font-semibold'>/month</span>
              </p>
              <p className='mt-6 text-gray-300'>For power users who want the ultimate experience</p>

              <ul className='mt-6 space-y-4'>
                {subscriptionFeatures.PLATINUM.map((feature, index) => (
                  <li key={index} className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <CheckCircle className='h-5 w-5 text-green-400' />
                    </div>
                    <p className='ml-3 text-sm text-gray-300'>{feature}</p>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('PLATINUM')}
              disabled={
                createPaymentMutation.isPending ||
                (subscription.isActive && subscription.subscriptionType === 'PLATINUM')
              }
              className='mt-8 block w-full bg-blue-400 hover:bg-blue-500 text-gray-900 font-bold py-3 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {createPaymentMutation.isPending
                ? 'Processing...'
                : subscription.isActive && subscription.subscriptionType === 'PLATINUM'
                  ? 'Current Plan'
                  : 'Subscribe to Platinum'}
            </button>
          </div>
        </div>

        {/* Payment options section */}
        <div className='mt-16 bg-white rounded-xl shadow-sm p-6 max-w-3xl mx-auto'>
          <div className='text-center mb-6'>
            <h3 className='text-lg font-semibold text-gray-900'>Secure Payment Options</h3>
            <p className='text-sm text-gray-500'>Fast and secure checkout with VNPAY</p>
          </div>

          <div className='grid grid-cols-3 gap-4'>
            {paymentOptions.map((option) => (
              <div key={option.id} className='flex flex-col items-center'>
                <div className='h-12 flex items-center justify-center'>
                  <img src={option.logo} alt={option.name} className='h-8 object-contain' />
                </div>
                <p className='text-xs text-gray-600 mt-2 text-center'>{option.name}</p>
              </div>
            ))}
          </div>

          <div className='mt-8 border-t border-gray-200 pt-6'>
            <div className='flex items-center justify-center'>
              <img
                src='https://sandbox.vnpayment.vn/paymentv2/images/img/ssl.png'
                alt='SSL Certificate'
                className='h-8 mx-2'
              />
              <img
                src='https://sandbox.vnpayment.vn/paymentv2/images/img/pcidss.png'
                alt='PCI DSS Compliant'
                className='h-8 mx-2'
              />
              <img
                src='https://sandbox.vnpayment.vn/paymentv2/images/img/verify-visa.png'
                alt='Verified by Visa'
                className='h-8 mx-2'
              />
            </div>
          </div>
        </div>

        <div className='mt-10 text-center'>
          <p className='text-base text-gray-500'>All plans include secure payment processing by VNPAY</p>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage
