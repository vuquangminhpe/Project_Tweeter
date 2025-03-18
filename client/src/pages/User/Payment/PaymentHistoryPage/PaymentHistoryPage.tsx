import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiPayment from '@/apis/payment.api'
import { PaymentHistoryItem } from '@/types/Payment.types'
import { ChevronLeft, ChevronRight, Download, Filter, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PaymentHistoryPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const navigate = useNavigate()
  const ITEMS_PER_PAGE = 10

  const {
    data: paymentsData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['payment-history', currentPage, filterStatus],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(filterStatus && { status: filterStatus })
      }
      const response = await apiPayment.getPaymentHistory(params)
      return response.data.data
    }
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewPaymentDetail = (orderId: string) => {
    navigate(`/user/payment/detail/${orderId}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value)
    setCurrentPage(1)
  }

  const handleGoToSubscription = () => {
    navigate('/user/subscription')
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4'>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Failed to load payment history</h2>
        <p className='text-gray-600 mb-4'>There was an error loading your payment history. Please try again later.</p>
        <button onClick={() => refetch()} className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'>
          Try Again
        </button>
      </div>
    )
  }

  const payments = paymentsData?.payments || []
  const filteredPayments = searchTerm
    ? payments.filter((payment) => payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()))
    : payments

  return (
    <div className='bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
            <h2 className='text-lg font-semibold text-gray-800'>Payment History</h2>
            <button
              onClick={handleGoToSubscription}
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm'
            >
              Manage Subscription
            </button>
          </div>

          <div className='px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0'>
            <form onSubmit={handleSearch} className='relative w-full sm:w-64'>
              <input
                type='text'
                placeholder='Search by Order ID'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
              <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
              <button type='submit' className='sr-only'>
                Search
              </button>
            </form>

            <div className='flex items-center'>
              <Filter className='h-4 w-4 text-gray-400 mr-2' />
              <select
                value={filterStatus}
                onChange={handleFilterChange}
                className='block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              >
                <option value=''>All Statuses</option>
                <option value='SUCCESS'>Successful</option>
                <option value='PENDING'>Pending</option>
                <option value='FAILED'>Failed</option>
                <option value='REFUNDED'>Refunded</option>
              </select>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className='px-6 py-12 text-center'>
              <p className='text-gray-500 text-lg'>No payment history found.</p>
              <button
                onClick={handleGoToSubscription}
                className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm'
              >
                Subscribe Now
              </button>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Date
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Order ID
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Subscription
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Amount
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Status
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredPayments.map((payment: PaymentHistoryItem) => (
                      <tr key={payment.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {payment.orderId}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {payment.subscriptionType}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          <button
                            onClick={() => handleViewPaymentDetail(payment.orderId)}
                            className='text-blue-600 hover:text-blue-900'
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='flex items-center text-sm text-gray-700 disabled:opacity-50'
                >
                  <ChevronLeft className='h-4 w-4 mr-1' />
                  Previous
                </button>
                <span className='text-sm text-gray-700'>
                  Page {currentPage} {/* Add total pages if available */}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={filteredPayments.length < ITEMS_PER_PAGE}
                  className='flex items-center text-sm text-gray-700 disabled:opacity-50'
                >
                  Next
                  <ChevronRight className='h-4 w-4 ml-1' />
                </button>
              </div>
            </>
          )}
        </div>

        <div className='mt-6 bg-white rounded-lg shadow overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-800'>Export Statement</h3>
          </div>
          <div className='px-6 py-4'>
            <p className='text-sm text-gray-600 mb-4'>
              Download your payment history for record keeping or accounting purposes.
            </p>
            <button className='flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
              <Download className='h-4 w-4 mr-2' />
              Download PDF Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentHistoryPage
