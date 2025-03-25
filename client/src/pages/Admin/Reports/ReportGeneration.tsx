/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import adminApi from '@/apis/admin.api'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ReportRequest {
  report_type: string
  from_date: string
  to_date: string
  format: 'json' | 'csv'
}

export default function ReportGeneration() {
  const [reportParams, setReportParams] = useState<ReportRequest>({
    report_type: 'user_growth',
    from_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to_date: new Date().toISOString().slice(0, 10),
    format: 'json'
  })

  const [reportResult, setReportResult] = useState<any>(null)

  const generateReportMutation = useMutation({
    mutationFn: (params: ReportRequest) => adminApi.generateReport(params),
    onSuccess: (response) => {
      toast.success('Report generated successfully')
      setReportResult(response.data.result)
    },
    onError: () => {
      toast.error('Failed to generate report')
    }
  })

  const handleParamChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setReportParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault()
    generateReportMutation.mutate(reportParams)
  }

  const handleDownloadReport = () => {
    if (!reportResult) return

    const dataStr = JSON.stringify(reportResult, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportParams.report_type}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <motion.h1
        className='text-3xl font-bold mb-8 text-gray-800'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Report Generation
      </motion.h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <motion.div
          className='lg:col-span-1 bg-white rounded-lg shadow-md p-6'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className='text-lg font-semibold mb-6 text-gray-800'>Generate Report</h2>
          <form onSubmit={handleGenerateReport}>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Report Type</label>
              <select
                name='report_type'
                value={reportParams.report_type}
                onChange={handleParamChange}
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='user_growth'>User Growth</option>
                <option value='content_analysis'>Content Analysis</option>
                <option value='engagement_metrics'>Engagement Metrics</option>
                <option value='revenue_summary'>Revenue Summary</option>
                <option value='moderation_actions'>Moderation Actions</option>
              </select>
            </div>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>From Date</label>
              <input
                type='date'
                name='from_date'
                value={reportParams.from_date}
                onChange={handleParamChange}
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>To Date</label>
              <input
                type='date'
                name='to_date'
                value={reportParams.to_date}
                onChange={handleParamChange}
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Format</label>
              <select
                name='format'
                value={reportParams.format}
                onChange={handleParamChange}
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='json'>JSON</option>
                <option value='csv'>CSV</option>
              </select>
            </div>
            <button
              type='submit'
              disabled={generateReportMutation.isPending}
              className='w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              {generateReportMutation.isPending ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Report'
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          className='lg:col-span-2 bg-white rounded-lg shadow-md p-6'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-semibold text-gray-800'>Report Preview</h2>
            {reportResult && (
              <button
                onClick={handleDownloadReport}
                className='flex items-center text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-colors'
              >
                <svg
                  className='w-4 h-4 mr-1'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                  ></path>
                </svg>
                Download Report
              </button>
            )}
          </div>

          {!reportResult ? (
            <div className='bg-gray-50 border border-gray-200 rounded-md p-8 text-center text-gray-500'>
              <svg
                className='w-16 h-16 mx-auto mb-4 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                ></path>
              </svg>
              <p className='text-lg'>No report generated yet</p>
              <p className='mt-2'>Select parameters and click Generate Report to see results</p>
            </div>
          ) : (
            <div className='bg-gray-50 border border-gray-200 rounded-md p-4 overflow-auto max-h-[600px]'>
              {reportParams.report_type === 'user_growth' && (
                <div>
                  <div className='mb-4'>
                    <h3 className='text-lg font-medium text-gray-800 mb-2'>User Growth Summary</h3>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div className='bg-white p-3 rounded-md shadow-sm'>
                        <div className='text-sm text-gray-500'>Total Users</div>
                        <div className='text-xl font-bold'>{reportResult.data.total_users.toLocaleString()}</div>
                      </div>
                      <div className='bg-white p-3 rounded-md shadow-sm'>
                        <div className='text-sm text-gray-500'>New Users</div>
                        <div className='text-xl font-bold'>
                          {reportResult.data.growth_over_time
                            .reduce((acc: number, curr: any) => acc + curr.new_users, 0)
                            .toLocaleString()}
                        </div>
                      </div>
                      <div className='bg-white p-3 rounded-md shadow-sm'>
                        <div className='text-sm text-gray-500'>Period</div>
                        <div className='text-md font-medium'>
                          {new Date(reportResult.from_date).toLocaleDateString()} -{' '}
                          {new Date(reportResult.to_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 className='font-medium text-gray-700 mb-2'>Growth Details</h4>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-100'>
                        <tr>
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
                            New Users
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {reportResult.data.growth_over_time.map((item: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{item.date}</td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
                              {item.new_users.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportParams.report_type !== 'user_growth' && (
                <pre className='text-sm text-gray-800 overflow-auto'>{JSON.stringify(reportResult, null, 2)}</pre>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        className='mt-8 bg-white rounded-lg shadow-md p-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className='text-lg font-semibold mb-4 text-gray-800'>Available Report Types</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='border border-gray-200 rounded-md p-4 hover:border-blue-500 hover:shadow-md transition-all'>
            <h3 className='font-medium text-gray-800 mb-2'>User Growth</h3>
            <p className='text-sm text-gray-600 mb-2'>
              Provides detailed information about user registration patterns over time.
            </p>
            <div className='text-xs text-gray-500'>Data includes: total users, new users per period, growth rates</div>
          </div>
          <div className='border border-gray-200 rounded-md p-4 hover:border-blue-500 hover:shadow-md transition-all'>
            <h3 className='font-medium text-gray-800 mb-2'>Content Analysis</h3>
            <p className='text-sm text-gray-600 mb-2'>Analyzes content creation patterns and media usage statistics.</p>
            <div className='text-xs text-gray-500'>Data includes: tweet counts, media usage, hashtag analytics</div>
          </div>
          <div className='border border-gray-200 rounded-md p-4 hover:border-blue-500 hover:shadow-md transition-all'>
            <h3 className='font-medium text-gray-800 mb-2'>Engagement Metrics</h3>
            <p className='text-sm text-gray-600 mb-2'>
              Tracks user interactions and engagement with content over time.
            </p>
            <div className='text-xs text-gray-500'>Data includes: likes, comments, shares, follow relationships</div>
          </div>
          <div className='border border-gray-200 rounded-md p-4 hover:border-blue-500 hover:shadow-md transition-all'>
            <h3 className='font-medium text-gray-800 mb-2'>Revenue Summary</h3>
            <p className='text-sm text-gray-600 mb-2'>Summarizes revenue streams and subscription conversions.</p>
            <div className='text-xs text-gray-500'>
              Data includes: total revenue, subscription breakdown, conversion rates
            </div>
          </div>
          <div className='border border-gray-200 rounded-md p-4 hover:border-blue-500 hover:shadow-md transition-all'>
            <h3 className='font-medium text-gray-800 mb-2'>Moderation Actions</h3>
            <p className='text-sm text-gray-600 mb-2'>Details content moderation activities and user reports.</p>
            <div className='text-xs text-gray-500'>
              Data includes: reports by type, moderation actions, banned users
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
