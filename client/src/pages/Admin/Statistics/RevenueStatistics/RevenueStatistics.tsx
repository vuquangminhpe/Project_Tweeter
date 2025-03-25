import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import adminApi from '@/apis/admin.api'
import {
  AreaChart,
  Area,
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
import { RevenueStatsParams } from '@/types/Admin.types'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

export default function RevenueStatistics() {
  const [params, setParams] = useState<RevenueStatsParams>({
    from_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to_date: new Date().toISOString().slice(0, 10),
    interval: 'monthly',
    subscription_type: undefined
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['revenue-statistics', params],
    queryFn: () => adminApi.getRevenueStats(params)
  })

  const revenueStats = data?.data?.result

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
    return <div className='text-red-500 text-center p-5'>Error loading revenue statistics. Please try again.</div>

  const subscriptionTypeData = revenueStats
    ? [
        { name: 'Premium', value: revenueStats.by_subscription_type.premium },
        { name: 'Platinum', value: revenueStats.by_subscription_type.platinum }
      ]
    : []

  const conversionRateData = revenueStats
    ? [
        { name: 'Free', value: revenueStats.conversion_rates.free_percentage },
        { name: 'Premium', value: revenueStats.conversion_rates.premium_percentage },
        { name: 'Platinum', value: revenueStats.conversion_rates.platinum_percentage }
      ]
    : []

  const stackedAreaData = revenueStats?.revenue_over_time.map((item) => ({
    date: item.date,
    premium: item.premium,
    platinum: item.platinum,
    total: item.premium + item.platinum
  }))

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <motion.h1
        className='text-3xl font-bold mb-8 text-gray-800'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Revenue Statistics
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
            <label className='block text-sm font-medium text-gray-700 mb-1'>Subscription Type</label>
            <select
              name='subscription_type'
              value={params.subscription_type}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All Types</option>
              <option value='1'>Premium</option>
              <option value='2'>Platinum</option>
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

      {revenueStats && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Total Revenue</div>
              <div className='text-3xl font-bold text-gray-800'>${revenueStats.total_revenue.toLocaleString()}</div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Premium Revenue</div>
              <div className='text-3xl font-bold text-gray-800'>
                ${revenueStats.by_subscription_type.premium.toLocaleString()}
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                {Math.round((revenueStats.by_subscription_type.premium / revenueStats.total_revenue) * 100)}% of total
                revenue
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Platinum Revenue</div>
              <div className='text-3xl font-bold text-gray-800'>
                ${revenueStats.by_subscription_type.platinum.toLocaleString()}
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                {Math.round((revenueStats.by_subscription_type.platinum / revenueStats.total_revenue) * 100)}% of total
                revenue
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
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>Revenue Over Time</h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={stackedAreaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Area
                      type='monotone'
                      dataKey='premium'
                      stackId='1'
                      stroke='#8884d8'
                      fill='#8884d8'
                      name='Premium'
                    />
                    <Area
                      type='monotone'
                      dataKey='platinum'
                      stackId='1'
                      stroke='#82ca9d'
                      fill='#82ca9d'
                      name='Platinum'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>Revenue by Subscription Type</h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={subscriptionTypeData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {subscriptionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
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
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>Monthly Revenue Comparison</h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={revenueStats.revenue_over_time} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey='premium' name='Premium' fill='#8884d8' />
                    <Bar dataKey='platinum' name='Platinum' fill='#82ca9d' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>User Conversion Rates</h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={conversionRateData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {conversionRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className='mt-4'>
                <h3 className='font-medium text-gray-700 mb-2'>Conversion Details</h3>
                <ul className='space-y-2'>
                  <li className='flex justify-between items-center'>
                    <span className='text-gray-600'>Free Users</span>
                    <div className='flex items-center'>
                      <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded'>
                        {revenueStats.conversion_rates.free_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                  <li className='flex justify-between items-center'>
                    <span className='text-gray-600'>Premium Conversion</span>
                    <div className='flex items-center'>
                      <span className='bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded'>
                        {revenueStats.conversion_rates.premium_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                  <li className='flex justify-between items-center'>
                    <span className='text-gray-600'>Platinum Conversion</span>
                    <div className='flex items-center'>
                      <span className='bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded'>
                        {revenueStats.conversion_rates.platinum_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
