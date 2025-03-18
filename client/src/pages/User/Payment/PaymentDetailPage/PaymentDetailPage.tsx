import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import apiPayment from '@/apis/payment.api'
import { PaymentDetail } from '@/types/Payment.types'
import { ArrowLeft, CheckCircle, Download, Loader, XCircle } from 'lucide-react'

const PaymentDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const {
    data: paymentData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['payment-detail', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required')
      }
      const response = await apiPayment.getPaymentStatus(orderId)
      return response.data.data
    },
    enabled: !!orderId,
    retry: 2
  })

  const handleBackToHistory = () => {
    navigate('/user/payment/history')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className='h-8 w-8 text-green-500' />
      case 'FAILED':
        return <XCircle className='h-8 w-8 text-red-500' />
      case 'PENDING':
        return <Loader className='h-8 w-8 text-yellow-500 animate-spin' />
      case 'REFUNDED':
        return <CheckCircle className='h-8 w-8 text-purple-500' />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (isError || !paymentData) {
    return (
      <div className='max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center mb-6'>
          <button onClick={handleBackToHistory} className='flex items-center text-blue-600 hover:text-blue-800'>
            <ArrowLeft className='h-5 w-5 mr-1' />
            Back to Payment History
          </button>
        </div>
        <div className='bg-white rounded-lg shadow overflow-hidden p-6 text-center'>
          <XCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>Payment Not Found</h2>
          <p className='text-gray-600 mb-6'>
            We couldn't find the payment details you're looking for. It may have been deleted or the Order ID is
            incorrect.
          </p>
          <button
            onClick={handleBackToHistory}
            className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
          >
            Return to Payment History
          </button>
        </div>
      </div>
    )
  }

  const payment: PaymentDetail = paymentData

  return (
    <div className='max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <div className='flex items-center mb-6'>
        <button onClick={handleBackToHistory} className='flex items-center text-blue-600 hover:text-blue-800'>
          <ArrowLeft className='h-5 w-5 mr-1' />
          Back to Payment History
        </button>
      </div>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-800'>Payment Receipt</h2>
          <button className='text-blue-600 hover:text-blue-800 flex items-center text-sm'>
            <Download className='h-4 w-4 mr-1' />
            Download
          </button>
        </div>

        <div className='px-6 py-6 flex flex-col items-center border-b border-gray-200'>
          {getStatusIcon(payment.status)}
          <h3 className='mt-2 text-xl font-bold text-gray-900'>
            {payment.status === 'SUCCESS'
              ? 'Payment Successful'
              : payment.status === 'PENDING'
                ? 'Payment Pending'
                : payment.status === 'REFUNDED'
                  ? 'Payment Refunded'
                  : 'Payment Failed'}
          </h3>
          <p className='text-3xl font-bold text-gray-900 mt-1'>{formatCurrency(payment.amount)}</p>
          <p className='text-gray-500 text-sm mt-1'>{formatDate(payment.createdAt)}</p>
        </div>

        <div className='px-6 py-4'>
          <div className='space-y-3'>
            <div className='flex justify-between py-2 border-b border-gray-100'>
              <span className='text-gray-600'>Order ID</span>
              <span className='font-medium text-gray-900'>{payment.orderId}</span>
            </div>
            <div className='flex justify-between py-2 border-b border-gray-100'>
              <span className='text-gray-600'>Subscription Type</span>
              <span className='font-medium text-gray-900'>{payment.subscriptionType}</span>
            </div>
            <div className='flex justify-between py-2 border-b border-gray-100'>
              <span className='text-gray-600'>Payment Status</span>
              <span
                className={`font-medium ${
                  payment.status === 'SUCCESS'
                    ? 'text-green-600'
                    : payment.status === 'PENDING'
                      ? 'text-yellow-600'
                      : payment.status === 'REFUNDED'
                        ? 'text-purple-600'
                        : 'text-red-600'
                }`}
              >
                {payment.status}
              </span>
            </div>
            {payment.bankCode && (
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600'>Bank</span>
                <span className='font-medium text-gray-900'>{payment.bankCode}</span>
              </div>
            )}
            {payment.cardType && (
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600'>Card Type</span>
                <span className='font-medium text-gray-900'>{payment.cardType}</span>
              </div>
            )}
            <div className='flex justify-between py-2 border-b border-gray-100'>
              <span className='text-gray-600'>Transaction Date</span>
              <span className='font-medium text-gray-900'>{formatDate(payment.createdAt)}</span>
            </div>
            {payment.updatedAt && (
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600'>Last Updated</span>
                <span className='font-medium text-gray-900'>{formatDate(payment.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className='px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0'>
          <div className='text-sm text-gray-500'>
            <p>Thank you for your subscription!</p>
            <p>For questions or support, contact our customer service.</p>
          </div>
          <button
            onClick={() => navigate('/user/subscription')}
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap'
          >
            Manage Subscription
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetailPage
