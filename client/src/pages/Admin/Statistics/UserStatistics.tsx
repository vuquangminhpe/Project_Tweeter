/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import adminApi from '@/apis/admin.api'
import {
  BarChart,
  Bar,
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
import { UserStatsParams } from '@/types/Admin.types'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function UserStatistics() {
  const [params, setParams] = useState<UserStatsParams>({
    from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to_date: new Date().toISOString().slice(0, 10),
    interval: 'daily',
    account_type: undefined,
    verification_status: undefined
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-statistics', params],
    queryFn: () => adminApi.getUserStats(params)
  })

  const userStats = data?.data?.result

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

  if (error) return <div className='text-red-500 text-center p-5'>Error loading user statistics. Please try again.</div>

  const verificationData = userStats
    ? [
        { name: 'Unverified', value: userStats.by_verification_status.unverified },
        { name: 'Verified', value: userStats.by_verification_status.verified },
        { name: 'Banned', value: userStats.by_verification_status.banned }
      ]
    : []

  const accountTypeData = userStats
    ? [
        { name: 'Free', value: userStats.by_account_type.free },
        { name: 'Premium', value: userStats.by_account_type.premium },
        { name: 'Platinum', value: userStats.by_account_type.platinum }
      ]
    : []

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <motion.h1
        className='text-3xl font-bold mb-8 text-gray-800'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        User Statistics
      </motion.h1>

      <motion.div
        className='bg-white rounded-lg shadow-md p-6 mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className='text-lg font-semibold mb-4 text-gray-800'>Filter Options</h2>
        <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
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
            <label className='block text-sm font-medium text-gray-700 mb-1'>Account Type</label>
            <select
              name='account_type'
              value={params.account_type}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All Types</option>
              <option value='0'>Free</option>
              <option value='1'>Premium</option>
              <option value='2'>Platinum</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Verification Status</label>
            <select
              name='verification_status'
              value={params.verification_status}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All Statuses</option>
              <option value='0'>Unverified</option>
              <option value='1'>Verified</option>
              <option value='2'>Banned</option>
            </select>
          </div>
          <div className='lg:col-span-5 mt-2'>
            <button
              type='submit'
              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors'
            >
              Apply Filters
            </button>
          </div>
        </form>
      </motion.div>

      {userStats && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Total Users</div>
              <div className='text-3xl font-bold text-gray-800'>{userStats.total_users.toLocaleString()}</div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Verified Users</div>
              <div className='text-3xl font-bold text-gray-800'>
                {userStats.by_verification_status.verified.toLocaleString()}
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                {Math.round((userStats.by_verification_status.verified / userStats.total_users) * 100)}% of total users
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Premium & Platinum Users</div>
              <div className='text-3xl font-bold text-gray-800'>
                {(userStats.by_account_type.premium + userStats.by_account_type.platinum).toLocaleString()}
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                {Math.round(
                  ((userStats.by_account_type.premium + userStats.by_account_type.platinum) / userStats.total_users) *
                    100
                )}
                % of total users
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
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>User Growth Over Time</h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={userStats.growth_over_time} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'New Users']} />
                    <Legend />
                    <Bar dataKey='new_users' fill='#8884d8' name='New Users' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>Users by Type</h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={accountTypeData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {accountTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} users`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <motion.div
            className='bg-white rounded-lg shadow-md p-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h2 className='text-lg font-semibold mb-4 text-gray-800'>Users by Verification Status</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-gray-50 rounded-lg p-4 text-center'>
                <div className='text-lg font-bold text-blue-500'>
                  {userStats.by_verification_status.unverified.toLocaleString()}
                </div>
                <div className='text-sm text-gray-500'>Unverified Users</div>
                <div className='text-xs text-gray-400 mt-1'>
                  {Math.round((userStats.by_verification_status.unverified / userStats.total_users) * 100)}% of total
                </div>
              </div>
              <div className='bg-gray-50 rounded-lg p-4 text-center'>
                <div className='text-lg font-bold text-green-500'>
                  {userStats.by_verification_status.verified.toLocaleString()}
                </div>
                <div className='text-sm text-gray-500'>Verified Users</div>
                <div className='text-xs text-gray-400 mt-1'>
                  {Math.round((userStats.by_verification_status.verified / userStats.total_users) * 100)}% of total
                </div>
              </div>
              <div className='bg-gray-50 rounded-lg p-4 text-center'>
                <div className='text-lg font-bold text-red-500'>
                  {userStats.by_verification_status.banned.toLocaleString()}
                </div>
                <div className='text-sm text-gray-500'>Banned Users</div>
                <div className='text-xs text-gray-400 mt-1'>
                  {Math.round((userStats.by_verification_status.banned / userStats.total_users) * 100)}% of total
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
