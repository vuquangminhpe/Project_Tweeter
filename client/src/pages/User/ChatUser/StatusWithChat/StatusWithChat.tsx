/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import conversationsApi from '@/apis/conversation.api'
import axios from 'axios'
import { UserStatus } from '../Chat'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface StatusWithChatProps {
  statusOnline: boolean
  onReceiverChange: (receiverId: string) => void
  onlineUsers: { [key: string]: UserStatus }
}

export default function StatusWithChat({ onReceiverChange, onlineUsers }: StatusWithChatProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab] = useState('all')

  const { data: dataFollowers, isLoading } = useQuery({
    queryKey: ['followers'],
    queryFn: () => conversationsApi.getAllConversationsWithFollower(10, 1)
  })
  const allData = dataFollowers?.data?.result

  const getProfile = async (username: string, userId: string) => {
    try {
      if (userId) {
        onReceiverChange(userId)
      } else {
        const response = await axios.get<{ _id: string }>(`/users/${username}`, {
          baseURL: import.meta.env.VITE_API_URL
        })
        onReceiverChange(response.data._id)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const filteredContacts =
    allData?.flatMap((data) =>
      Array(data.users_follower_info)
        .filter((user: any) => {
          if (searchTerm) {
            return (
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.username.toLowerCase().includes(searchTerm.toLowerCase())
            )
          }
          return true
        })
        .filter((user: any) => {
          if (activeTab === 'online') {
            return onlineUsers[user._id]?.is_online
          }
          if (activeTab === 'recent') {
            return (
              onlineUsers[user._id]?.last_active &&
              new Date().getTime() - new Date(onlineUsers[user._id]?.last_active).getTime() < 24 * 60 * 60 * 1000
            )
          }
          return true
        })
    ) || []

  const sortedContacts = [...filteredContacts].sort((a: any, b: any) => {
    const aOnline = onlineUsers[a._id]?.is_online || false
    const bOnline = onlineUsers[b._id]?.is_online || false

    if (aOnline && !bOnline) return -1
    if (!aOnline && bOnline) return 1
    return a.name.localeCompare(b.name)
  })

  if (isLoading) {
    return (
      <div className='h-full flex items-center justify-center bg-[#161b22]'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='relative w-10 h-10'>
            <div className='absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin'></div>
            <div className='absolute inset-1 rounded-full border-2 border-transparent border-r-violet-500 animate-spin animation-delay-150'></div>
          </div>
          <p className='text-indigo-300'>Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='h-full flex flex-col bg-[#161b22]'>
      {/* Header with search */}
      <div className='p-4 border-b border-[#30363d] bg-[#161b22]'>
        <div className='relative'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search contacts'
            className='w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 placeholder-gray-500 transition-all'
          />
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200'
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className='flex gap-3 border-b border-[#30363d]'></div>

      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        <div className='py-2'>
          {sortedContacts.map((user: any, index: number) => (
            <motion.button
              key={user.username || index}
              onClick={() => getProfile(user.username, user._id)}
              className='w-full px-4 py-3 hover:bg-[#24292f] bg-black flex items-center space-x-3 group'
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className='relative'>
                <div
                  className={`absolute inset-0 rounded-full ${
                    onlineUsers[user._id]?.is_online
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse-slow opacity-20'
                      : 'bg-transparent'
                  }`}
                ></div>

                <div className='relative'>
                  <Avatar className='h-10 w-10 border-2 border-[#30363d] bg-[#0d1117]'>
                    <AvatarImage src={user.avatar || user.cover_photo} className='object-cover' />
                    <AvatarFallback className='bg-[#1d2432] text-indigo-300'>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {onlineUsers[user._id] && onlineUsers[user._id].is_online && (
                    <span className='absolute bottom-0 right-0 h-3 w-3'>
                      <span className='absolute inset-0 rounded-full bg-emerald-500 opacity-50 animate-ping-slow'></span>
                      <span className='relative inline-flex h-full w-full rounded-full bg-emerald-500 border-2 border-[#161b22]'></span>
                    </span>
                  )}
                </div>
              </div>

              <div className='flex-1 flex flex-col items-start overflow-hidden'>
                <div className='flex items-center w-full'>
                  <span className='font-medium text-gray-200 truncate'>{user.name}</span>
                  {onlineUsers[user._id]?.is_online && (
                    <span className='ml-2 px-1.5 py-0.5 text-xs rounded-full bg-emerald-900 text-emerald-300'>
                      online
                    </span>
                  )}
                </div>
                <span className='text-xs text-gray-400 truncate w-full text-left'>
                  {onlineUsers[user._id]?.is_online
                    ? 'Active now'
                    : onlineUsers[user._id]?.last_active
                      ? `Last seen ${formatLastActive(onlineUsers[user._id].last_active)}`
                      : '@' + user.username}
                </span>
              </div>

              <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-indigo-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )

  function formatLastActive(date: Date) {
    const lastActive = new Date(date)
    const now = new Date()
    const diffInMilliseconds = Math.abs(now.getTime() - lastActive.getTime())
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))

    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }
}
