/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ContentStatsParams } from '@/types/Admin.types'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function ContentStatistics() {
  const [params, setParams] = useState<ContentStatsParams>({
    from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to_date: new Date().toISOString().slice(0, 10),
    interval: 'daily',
    content_type: undefined,
    has_media: undefined
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content-statistics', params],
    queryFn: () => adminApi.getContentStats(params)
  })

  const contentStats = data?.data?.result

  const handleParamChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setParams((prev: any) => ({ ...prev, [name]: value }))
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
    return <div className='text-red-500 text-center p-5'>Error loading content statistics. Please try again.</div>

  const tweetTypeData = contentStats
    ? [
        { name: 'Tweet', value: contentStats.by_tweet_type.tweet },
        { name: 'Retweet', value: contentStats.by_tweet_type.retweet },
        { name: 'Comment', value: contentStats.by_tweet_type.comment },
        { name: 'Quote Tweet', value: contentStats.by_tweet_type.quote_tweet }
      ]
    : []

  const mediaData = contentStats
    ? [
        { name: 'With Media', value: contentStats.tweets_with_media },
        { name: 'Without Media', value: contentStats.total_tweets - contentStats.tweets_with_media }
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
        Content Statistics
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
            <label className='block text-sm font-medium text-gray-700 mb-1'>Content Type</label>
            <select
              name='content_type'
              value={params.content_type}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All Types</option>
              <option value='0'>Tweet</option>
              <option value='1'>Retweet</option>
              <option value='2'>Comment</option>
              <option value='3'>Quote Tweet</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Has Media</label>
            <select
              name='has_media'
              value={params.has_media}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All</option>
              <option value='true'>With Media</option>
              <option value='false'>Without Media</option>
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

      {contentStats && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Total Tweets</div>
              <div className='text-3xl font-bold text-gray-800'>{contentStats.total_tweets.toLocaleString()}</div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Tweets With Media</div>
              <div className='text-3xl font-bold text-gray-800'>{contentStats.tweets_with_media.toLocaleString()}</div>
              <div className='text-xs text-gray-500 mt-2'>
                {Math.round((contentStats.tweets_with_media / contentStats.total_tweets) * 100)}% of total tweets
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-lg shadow-md p-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className='text-sm text-gray-500 mb-2'>Original Tweets</div>
              <div className='text-3xl font-bold text-gray-800'>
                {contentStats.by_tweet_type.tweet.toLocaleString()}
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                {Math.round((contentStats.by_tweet_type.tweet / contentStats.total_tweets) * 100)}% of total tweets
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
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>Content Growth Over Time</h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={contentStats.growth_over_time} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'New Tweets']} />
                    <Legend />
                    <Bar dataKey='new_tweets' fill='#82ca9d' name='New Tweets' />
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
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>Content by Type</h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={tweetTypeData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {tweetTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} tweets`, 'Count']} />
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
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>Popular Hashtags</h2>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead>
                    <tr>
                      <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Hashtag
                      </th>
                      <th className='px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Count
                      </th>
                      <th className='px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {contentStats.popular_hashtags.map((hashtag, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>#{hashtag.hashtag}</td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
                          {hashtag.count.toLocaleString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-right text-blue-500'>
                          {Math.round((hashtag.count / contentStats.total_tweets) * 100)}%
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
              <h2 className='text-lg font-semibold mb-4 text-gray-800'>Content Breakdown</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='font-medium text-gray-700 mb-3'>By Tweet Type</h3>
                  <ul className='space-y-2'>
                    <li className='flex justify-between'>
                      <span className='text-gray-600'>Tweets</span>
                      <span className='font-medium'>
                        {contentStats.by_tweet_type.tweet.toLocaleString()} (
                        {Math.round((contentStats.by_tweet_type.tweet / contentStats.total_tweets) * 100)}%)
                      </span>
                    </li>
                    <li className='flex justify-between'>
                      <span className='text-gray-600'>Retweets</span>
                      <span className='font-medium'>
                        {contentStats.by_tweet_type.retweet.toLocaleString()} (
                        {Math.round((contentStats.by_tweet_type.retweet / contentStats.total_tweets) * 100)}%)
                      </span>
                    </li>
                    <li className='flex justify-between'>
                      <span className='text-gray-600'>Comments</span>
                      <span className='font-medium'>
                        {contentStats.by_tweet_type.comment.toLocaleString()} (
                        {Math.round((contentStats.by_tweet_type.comment / contentStats.total_tweets) * 100)}%)
                      </span>
                    </li>
                    <li className='flex justify-between'>
                      <span className='text-gray-600'>Quote Tweets</span>
                      <span className='font-medium'>
                        {contentStats.by_tweet_type.quote_tweet.toLocaleString()} (
                        {Math.round((contentStats.by_tweet_type.quote_tweet / contentStats.total_tweets) * 100)}%)
                      </span>
                    </li>
                  </ul>
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='font-medium text-gray-700 mb-3'>By Media Presence</h3>
                  <ul className='space-y-2'>
                    <li className='flex justify-between'>
                      <span className='text-gray-600'>With Media</span>
                      <span className='font-medium'>
                        {contentStats.tweets_with_media.toLocaleString()} (
                        {Math.round((contentStats.tweets_with_media / contentStats.total_tweets) * 100)}%)
                      </span>
                    </li>
                    <li className='flex justify-between'>
                      <span className='text-gray-600'>Without Media</span>
                      <span className='font-medium'>
                        {(contentStats.total_tweets - contentStats.tweets_with_media).toLocaleString()} (
                        {Math.round(
                          ((contentStats.total_tweets - contentStats.tweets_with_media) / contentStats.total_tweets) *
                            100
                        )}
                        %)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
