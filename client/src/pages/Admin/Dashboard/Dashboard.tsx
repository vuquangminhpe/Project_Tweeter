import React, { useEffect, useState } from 'react'
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
  Cell
} from 'recharts'
import { motion } from 'framer-motion'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboardStats()
  })

  const dashboardStats = data?.data?.result

  const [chartData, setChartData] = useState<{ name: string; users: number; tweets: number }[]>([])
  const [subscriptionData, setSubscriptionData] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    if (dashboardStats) {
      const chartData = dashboardStats.trends.users.map((item, index) => {
        return {
          name: item.date,
          users: item.new_users,
          tweets: dashboardStats.trends.tweets[index]?.new_tweets || 0
        }
      })
      setChartData(chartData)

      const subscriptionData = [
        { name: 'Free', value: dashboardStats.subscription_distribution.free },
        { name: 'Premium', value: dashboardStats.subscription_distribution.premium },
        { name: 'Platinum', value: dashboardStats.subscription_distribution.platinum }
      ]
      setSubscriptionData(subscriptionData)
    }
  }, [dashboardStats])

  if (isLoading)
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )

  if (error) return <div className='text-red-500 text-center p-5'>Error loading dashboard data. Please try again.</div>

  if (!dashboardStats) return null

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <motion.h1
        className='text-3xl font-bold mb-8 text-gray-800'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <motion.div
          className='bg-white rounded-lg shadow-md p-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className='text-sm text-gray-500 mb-2'>Total Users</div>
          <div className='flex items-end'>
            <div className='text-3xl font-bold text-gray-800'>{dashboardStats.users.total.toLocaleString()}</div>
            <div className='ml-2 text-sm text-green-500'>+{dashboardStats.users.new_today} today</div>
          </div>
          <div className='text-xs text-gray-500 mt-2'>{dashboardStats.users.active_24h} active users in last 24h</div>
        </motion.div>

        <motion.div
          className='bg-white rounded-lg shadow-md p-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className='text-sm text-gray-500 mb-2'>Total Tweets</div>
          <div className='flex items-end'>
            <div className='text-3xl font-bold text-gray-800'>
              {dashboardStats.content.total_tweets.toLocaleString()}
            </div>
            <div className='ml-2 text-sm text-green-500'>+{dashboardStats.content.new_tweets_today} today</div>
          </div>
        </motion.div>

        <motion.div
          className='bg-white rounded-lg shadow-md p-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className='text-sm text-gray-500 mb-2'>Total Likes</div>
          <div className='flex items-end'>
            <div className='text-3xl font-bold text-gray-800'>
              {dashboardStats.interactions.total_likes.toLocaleString()}
            </div>
            <div className='ml-2 text-sm text-green-500'>+{dashboardStats.interactions.new_likes_today} today</div>
          </div>
        </motion.div>

        <motion.div
          className='bg-white rounded-lg shadow-md p-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className='text-sm text-gray-500 mb-2'>Revenue Today</div>
          <div className='flex items-end'>
            <div className='text-3xl font-bold text-gray-800'>${dashboardStats.revenue.today.toLocaleString()}</div>
            <div
              className={`ml-2 text-sm ${dashboardStats.revenue.growth_percentage > 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {dashboardStats.revenue.growth_percentage > 0 ? '+' : ''}
              {dashboardStats.revenue.growth_percentage.toFixed(1)}%
            </div>
          </div>
          <div className='text-xs text-gray-500 mt-2'>
            Yesterday: ${dashboardStats.revenue.yesterday.toLocaleString()}
          </div>
        </motion.div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
        <motion.div
          className='bg-white rounded-lg shadow-md p-6 lg:col-span-2'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className='text-lg font-semibold mb-4 text-gray-800'>Growth Trends</h2>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type='monotone' dataKey='users' stroke='#8884d8' activeDot={{ r: 8 }} name='New Users' />
                <Line type='monotone' dataKey='tweets' stroke='#82ca9d' name='New Tweets' />
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
          <h2 className='text-lg font-semibold mb-4 text-gray-800'>Subscription Distribution</h2>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <motion.div
          className='bg-white rounded-lg shadow-md p-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className='text-lg font-semibold mb-4 text-gray-800'>Latest Statistics</h2>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead>
                <tr>
                  <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Metric
                  </th>
                  <th className='px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Value
                  </th>
                  <th className='px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                <tr>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>Active Users (24h)</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
                    {dashboardStats.users.active_24h}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-right text-green-500'>
                    +{Math.round((dashboardStats.users.active_24h / dashboardStats.users.total) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>New Tweets Today</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
                    {dashboardStats.content.new_tweets_today}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-right text-green-500'>
                    +{Math.round((dashboardStats.content.new_tweets_today / dashboardStats.content.total_tweets) * 100)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>New Likes Today</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
                    {dashboardStats.interactions.new_likes_today}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-right text-green-500'>
                    +
                    {Math.round(
                      (dashboardStats.interactions.new_likes_today / dashboardStats.interactions.total_likes) * 100
                    )}
                    %
                  </td>
                </tr>
                <tr>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>Premium Users</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
                    {dashboardStats.subscription_distribution.premium}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-right text-green-500'>
                    +{Math.round((dashboardStats.subscription_distribution.premium / dashboardStats.users.total) * 100)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>Platinum Users</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
                    {dashboardStats.subscription_distribution.platinum}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-right text-green-500'>
                    +
                    {Math.round((dashboardStats.subscription_distribution.platinum / dashboardStats.users.total) * 100)}
                    %
                  </td>
                </tr>
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
          <h2 className='text-lg font-semibold mb-4 text-gray-800'>Quick Actions</h2>
          <div className='grid grid-cols-1 gap-4'>
            <a
              href='/admin/users'
              className='bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-between'
            >
              <span>Manage Users</span>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3'></path>
              </svg>
            </a>
            <a
              href='/admin/statistics/users'
              className='bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-between'
            >
              <span>User Statistics</span>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3'></path>
              </svg>
            </a>
            <a
              href='/admin/statistics/content'
              className='bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-between'
            >
              <span>Content Statistics</span>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3'></path>
              </svg>
            </a>
            <a
              href='/admin/statistics/revenue'
              className='bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-between'
            >
              <span>Revenue Statistics</span>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3'></path>
              </svg>
            </a>
            <a
              href='/admin/moderation/reported'
              className='bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-between'
            >
              <span>Content Moderation</span>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3'></path>
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
