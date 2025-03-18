import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiPayment from '@/apis/payment.api'
import { PaymentDetail } from '@/types/Payment.types'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()

  const orderId = searchParams.get('orderId')
  const status = searchParams.get('status')

  const {
    data: paymentData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['payment-status', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Missing payment information')
      }
      try {
        const response = await apiPayment.getPaymentStatus(orderId)
        if (response.data?.data) {
          return response.data.data
        } else if (response.data) {
          return response.data
        } else {
          throw new Error('Invalid API response structure')
        }
      } catch (error) {
        console.error('Error fetching payment status:', error)
        throw error
      }
    },
    enabled: !!orderId,
    retry: 3
  })

  useEffect(() => {
    if (status === 'ERROR') {
      setError('Payment processing encountered an error')
    }
  }, [status])

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleViewSubscription = () => {
    navigate('/user/subscription')
  }

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
        <Loader className='h-12 w-12 text-blue-500 animate-spin mb-4' />
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Verifying Payment</h2>
        <p className='text-gray-600'>Please wait while we verify your payment...</p>
      </div>
    )
  }

  if (error || isError) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
        <XCircle className='h-16 w-16 text-red-500 mb-4' />
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Payment Verification Failed</h2>
        <p className='text-gray-600 mb-8'>{error}</p>
        <div className='flex space-x-4'>
          <button
            onClick={handleBackToHome}
            className='px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
          >
            Back to Home
          </button>
          <button
            onClick={handleViewSubscription}
            className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const paymentStatus: PaymentDetail = paymentData as PaymentDetail

  if (paymentStatus?.status === 'SUCCESS') {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
        <CheckCircle className='h-16 w-16 text-green-500 mb-4' />
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Payment Successful!</h2>
        <p className='text-gray-600 mb-2'>Your {paymentStatus.subscriptionType} subscription has been activated.</p>
        <div className='bg-white rounded-lg shadow-md p-6 w-full max-w-md my-6'>
          <div className='flex justify-between mb-3'>
            <span className='text-gray-600'>Order ID:</span>
            <span className='font-medium'>{paymentStatus.orderId}</span>
          </div>
          <div className='flex justify-between mb-3'>
            <span className='text-gray-600'>Amount:</span>
            <span className='font-medium'>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(paymentStatus.amount)}
            </span>
          </div>
          {paymentStatus.bankCode && (
            <div className='flex justify-between mb-3'>
              <span className='text-gray-600'>Bank:</span>
              <span className='font-medium'>{paymentStatus.bankCode}</span>
            </div>
          )}
          <div className='flex justify-between mb-3'>
            <span className='text-gray-600'>Plan:</span>
            <span className='font-medium'>{paymentStatus.subscriptionType}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-600'>Date:</span>
            <span className='font-medium'>{new Date(paymentStatus.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className='flex space-x-4'>
          <button
            onClick={handleBackToHome}
            className='px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600'
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
      <XCircle className='h-16 w-16 text-yellow-500 mb-4' />
      <h2 className='text-2xl font-bold text-gray-800 mb-2'>Payment {paymentStatus?.status || 'Pending'}</h2>
      <p className='text-gray-600 mb-8'>
        {paymentStatus?.status === 'FAILED'
          ? 'Your payment was unsuccessful.'
          : 'Your payment is still being processed.'}
      </p>
      <div className='bg-white rounded-lg shadow-md p-6 w-full max-w-md my-6'>
        <div className='flex justify-between mb-3'>
          <span className='text-gray-600'>Status:</span>
          <span className='font-medium'>{paymentStatus?.status || 'Unknown'}</span>
        </div>
        <div className='flex justify-between mb-3'>
          <span className='text-gray-600'>Order ID:</span>
          <span className='font-medium'>{paymentStatus?.orderId || 'N/A'}</span>
        </div>
      </div>
      <div className='flex space-x-4'>
        <button onClick={handleBackToHome} className='px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'>
          Back to Home
        </button>
        <button
          onClick={handleViewSubscription}
          className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
        >
          View Subscription
        </button>
      </div>
    </div>
  )
}

export default PaymentResultPage
