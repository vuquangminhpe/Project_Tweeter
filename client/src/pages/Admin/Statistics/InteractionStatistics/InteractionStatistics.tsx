import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import adminApi from '@/apis/admin.api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { motion } from 'framer-motion'
import { InteractionStatsParams } from '@/types/Admin.types'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function InteractionStatistics() {
  const [params, setParams] = useState<InteractionStatsParams>({
    from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to_date: new Date().toISOString().slice(0, 10),
    interval: 'daily',
    interaction_type: undefined
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['interaction-statistics', params],
    queryFn: () => adminApi.getInteractionStats(params)
  })

  const interactionStats = data?.data?.result

  const handleParamChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  if (isLoading)
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )

  if (error)
    return <div className='text-red-500 text-center p-5'>Error loading interaction statistics. Please try again.</div>

  const interactionTypeData = interactionStats
    ? [
        { name: 'Likes', value: interactionStats.total_likes },
        { name: 'Bookmarks', value: interactionStats.total_bookmarks },
        { name: 'Comments', value: interactionStats.total_comments },
        { name: 'Follows', value: interactionStats.total_follows }
      ]
    : []

  const totalInteractions = interactionStats
    ? interactionStats.total_likes +
      interactionStats.total_bookmarks +
      interactionStats.total_comments +
      interactionStats.total_follows
    : 0

  const combineChartData = interactionStats
    ? interactionStats.interactions_over_time.likes.map((item, index) => ({
        date: item.date,
        likes: item.count,
        bookmarks: interactionStats.interactions_over_time.bookmarks[index]?.count || 0,
        comments: interactionStats.interactions_over_time.comments[index]?.count || 0
      }))
    : []

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <motion.h1
        className='text-3xl font-bold mb-8 text-gray-800'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Interaction Statistics
      </motion.h1>

      <motion.div
        className='bg-white rounded-lg shadow-md p-6 mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className='text-lg font-semibold mb-4 text-gray-800'>Filter Options</h2>
        <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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
            <label className='block text-sm font-medium text-gray-700 mb-1'>Interval</label>
            <select
              name='interval'
              value={params.interval}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='daily'>Daily</option>
              <option value='weekly'>Weekly</option>
              <option value='monthly'>Monthly</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Interaction Type</label>
            <select
              name='interaction_type'
              value={params.interaction_type}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All Types</option>
              <option value='like'>Like</option>
              <option value='bookmark'>Bookmark</option>
              <option value='comment'>Comment</option>
              <option value='follow'>Follow</option>
            </select>
          </div>
          <div className='lg:col-span-4 mt-2'>
            <button
              type='submit'
              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors'
            >
              Apply Filters
            </button>
          </div>
        </form>
      </motion.div>

      {interactionStats && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Total Likes</div>
              <div className='text-3xl font-bold text-gray-800'>{interactionStats.total_likes.toLocaleString()}</div>
              <div className='text-xs text-gray-500 mt-2'>
                {Math.round((interactionStats.total_likes / totalInteractions) * 100)}% of all interactions
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Total Bookmarks</div>
              <div className='text-3xl font-bold text-gray-800'>
                {interactionStats.total_bookmarks.toLocaleString()}
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                {Math.round((interactionStats.total_bookmarks / totalInteractions) * 100)}% of all interactions
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Total Comments</div>
              <div className='text-3xl font-bold text-gray-800'>{interactionStats.total_comments.toLocaleString()}</div>
              <div className='text-xs text-gray-500 mt-2'>
                {Math.round((interactionStats.total_comments / totalInteractions) * 100)}% of all interactions
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Total Follows</div>
              <div className='text-3xl font-bold text-gray-800'>{interactionStats.total_follows.toLocaleString()}</div>
              <div className='text-xs text-gray-500 mt-2'>
                {Math.round((interactionStats.total_follows / totalInteractions) * 100)}% of all interactions
              </div>
            </motion.div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>Interactions Over Time</h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={combineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
                    <Legend />
                    <Line type='monotone' dataKey='likes' stroke='#8884d8' name='Likes' />
                    <Line type='monotone' dataKey='bookmarks' stroke='#82ca9d' name='Bookmarks' />
                    <Line type='monotone' dataKey='comments' stroke='#ffc658' name='Comments' />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>Interaction Distribution</h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={interactionTypeData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {interactionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <motion.div
            className='bg-white rounded-lg shadow-md p-6 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h2 className='text-lg font-semibold mb-4 text-gray-800'>Top Engaged Tweets</h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr>
                    <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Content
                    </th>
                    <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      User
                    </th>
                    <th className='px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Likes
                    </th>
                    <th className='px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Bookmarks
                    </th>
                    <th className='px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Comments
                    </th>
                    <th className='px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {interactionStats.top_engaged_tweets.map((tweet, index) => (
                    <tr key={tweet._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate'>
                        {tweet.content}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{tweet.user_name}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                        {tweet.likes_count.toLocaleString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                        {tweet.bookmarks_count.toLocaleString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900'>
                        {tweet.comments_count.toLocaleString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-blue-600'>
                        {tweet.total_engagement.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            className='bg-white rounded-lg shadow-md p-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h2 className='text-lg font-semibold mb-4 text-gray-800'>Top Engaged Tweets Comparison</h2>
            <div className='h-96'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={interactionStats.top_engaged_tweets.slice(0, 5).map((tweet) => ({
                    name: tweet.content.length > 30 ? tweet.content.substring(0, 30) + '...' : tweet.content,
                    likes: tweet.likes_count,
                    bookmarks: tweet.bookmarks_count,
                    comments: tweet.comments_count
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' angle={-45} textAnchor='end' height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
                  <Legend />
                  <Bar dataKey='likes' name='Likes' fill='#8884d8' />
                  <Bar dataKey='bookmarks' name='Bookmarks' fill='#82ca9d' />
                  <Bar dataKey='comments' name='Comments' fill='#ffc658' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
