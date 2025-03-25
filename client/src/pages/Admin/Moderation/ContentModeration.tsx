import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import adminApi from '@/apis/admin.api'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ReportedContentParams } from '@/types/Admin.types'

export default function ContentModeration() {
  const queryClient = useQueryClient()
  const [params, setParams] = useState<ReportedContentParams>({
    content_type: undefined,
    status: 'pending',
    from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to_date: new Date().toISOString().slice(0, 10),
    page: 1,
    limit: 10
  })

  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [moderationAction, setModerationAction] = useState<string>('reviewed')
  const [moderationReason, setModerationReason] = useState<string>('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['reported-content', params],
    queryFn: () => adminApi.getReportedContent(params)
  })

  const moderateContentMutation = useMutation({
    mutationFn: ({ report_id, action, reason }: { report_id: string; action: string; reason: string }) =>
      adminApi.moderateContent(report_id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reported-content'] })
      toast.success('Content moderated successfully')
      setSelectedReport(null)
      setModerationReason('')
    },
    onError: () => {
      toast.error('Failed to moderate content')
    }
  })

  const { data: statsData } = useQuery({
    queryKey: ['moderation-stats'],
    queryFn: () => adminApi.getModerationStats()
  })

  const moderationStats = statsData?.data?.result

  const reportedContent = data?.data?.result

  const handleParamChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }))
  }

  const handleModerate = (report_id: string) => {
    if (!moderationReason) {
      toast.error('Please provide a reason for moderation')
      return
    }
    moderateContentMutation.mutate({
      report_id,
      action: moderationAction,
      reason: moderationReason
    })
  }

  const getReasonLabel = (reason: string) => {
    const formattedReason = reason.replace(/_/g, ' ')
    return formattedReason.charAt(0).toUpperCase() + formattedReason.slice(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'ignored':
        return 'bg-gray-100 text-gray-800'
      case 'removed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading)
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )

  if (error)
    return <div className='text-red-500 text-center p-5'>Error loading reported content. Please try again.</div>

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <motion.h1
        className='text-3xl font-bold mb-8 text-gray-800'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Content Moderation
      </motion.h1>

      {moderationStats && (
        <motion.div
          className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='text-sm text-gray-500 mb-2'>Pending Reports</div>
            <div className='text-3xl font-bold text-yellow-500'>{moderationStats.reports_by_status.pending}</div>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='text-sm text-gray-500 mb-2'>Reviewed Reports</div>
            <div className='text-3xl font-bold text-blue-500'>{moderationStats.reports_by_status.reviewed}</div>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='text-sm text-gray-500 mb-2'>Removed Content</div>
            <div className='text-3xl font-bold text-red-500'>{moderationStats.reports_by_status.removed}</div>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='text-sm text-gray-500 mb-2'>Banned Users</div>
            <div className='text-3xl font-bold text-gray-800'>{moderationStats.banned_users_count}</div>
            <div className='text-xs text-gray-500 mt-1'>{moderationStats.active_bans_count} currently active</div>
          </div>
        </motion.div>
      )}

      <motion.div
        className='bg-white rounded-lg shadow-md p-6 mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className='text-lg font-semibold mb-4 text-gray-800'>Filter Reports</h2>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Content Type</label>
            <select
              name='content_type'
              value={params.content_type}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All Types</option>
              <option value='tweet'>Tweets</option>
              <option value='comment'>Comments</option>
              <option value='user_bio'>User Bio</option>
              <option value='story'>Stories</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
            <select
              name='status'
              value={params.status}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='pending'>Pending</option>
              <option value='reviewed'>Reviewed</option>
              <option value='ignored'>Ignored</option>
              <option value='removed'>Removed</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>From Date</label>
            <input
              type='date'
              name='from_date'
              value={params.from_date}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>To Date</label>
            <input
              type='date'
              name='to_date'
              value={params.to_date}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Results Per Page</label>
            <select
              name='limit'
              value={params.limit}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='20'>20</option>
              <option value='50'>50</option>
            </select>
          </div>
        </div>
      </motion.div>

      {reportedContent && (
        <motion.div
          className='bg-white rounded-lg shadow-md overflow-hidden'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Content
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Reported By
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Type
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Reason
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
                    Date
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {reportedContent.reports.map((report) => (
                  <tr key={report._id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <img
                            className='h-10 w-10 rounded-full'
                            src={report.content.user.avatar || 'https://via.placeholder.com/40'}
                            alt=''
                          />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>{report.content.user.name}</div>
                          <div className='text-sm text-gray-500 max-w-xs truncate'>{report.content.content}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-8 w-8'>
                          <img
                            className='h-8 w-8 rounded-full'
                            src={report.reporter.avatar || 'https://via.placeholder.com/32'}
                            alt=''
                          />
                        </div>
                        <div className='ml-3'>
                          <div className='text-sm text-gray-900'>{report.reporter.name}</div>
                          <div className='text-xs text-gray-500'>@{report.reporter.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize'>
                      {report.content_type}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'>
                        {getReasonLabel(report.reason)}
                      </span>
                      {report.description && (
                        <p className='text-xs text-gray-500 mt-1 max-w-xs truncate'>{report.description}</p>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      {report.status === 'pending' ? (
                        <button
                          onClick={() => setSelectedReport(report._id)}
                          className='text-blue-600 hover:text-blue-900'
                        >
                          Moderate
                        </button>
                      ) : (
                        <span className='text-gray-400'>Handled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Showing <span className='font-medium'>{reportedContent.reports.length}</span> of{' '}
              <span className='font-medium'>{reportedContent.pagination.total}</span> reports
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() => handlePageChange(params.page! - 1)}
                disabled={params.page === 1}
                className={`px-3 py-1 rounded-md ${params.page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300`}
              >
                Previous
              </button>
              <div className='flex space-x-1'>
                {Array.from({ length: Math.min(5, reportedContent.pagination.total_pages) }, (_, i) => {
                  const page = params.page! <= 3 ? i + 1 : params.page! - 2 + i
                  if (page > reportedContent.pagination.total_pages) return null
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md border ${params.page === page ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  )
                })}
                {params.page! + 2 < reportedContent.pagination.total_pages && (
                  <>
                    <span className='self-center'>...</span>
                    <button
                      onClick={() => handlePageChange(reportedContent.pagination.total_pages)}
                      className={`px-3 py-1 rounded-md border ${params.page === reportedContent.pagination.total_pages ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                      {reportedContent.pagination.total_pages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => handlePageChange(params.page! + 1)}
                disabled={params.page === reportedContent.pagination.total_pages}
                className={`px-3 py-1 rounded-md ${params.page === reportedContent.pagination.total_pages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300`}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {selectedReport && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <motion.div
            className='bg-white rounded-lg shadow-xl max-w-lg w-full p-6'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Moderate Content</h3>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Action</label>
              <select
                value={moderationAction}
                onChange={(e) => setModerationAction(e.target.value)}
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='reviewed'>Review (No Action)</option>
                <option value='ignored'>Ignore Report</option>
                <option value='removed'>Remove Content</option>
              </select>
            </div>
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Reason</label>
              <textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                rows={3}
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Provide a reason for this moderation action...'
              />
            </div>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setSelectedReport(null)}
                className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerate(selectedReport)}
                className='px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
