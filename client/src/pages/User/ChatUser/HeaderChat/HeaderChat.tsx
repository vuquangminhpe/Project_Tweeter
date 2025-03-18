/* eslint-disable @typescript-eslint/no-explicit-any */
import socket from '@/utils/socket'
import React, { useEffect } from 'react'
import { UserStatus } from '../Chat'
import apiUser from '@/apis/users.api'
import { useQuery } from '@tanstack/react-query'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'

interface HeaderChatProps {
  onlineReceiver: boolean
  setOnlineUsers: React.Dispatch<React.SetStateAction<{ [key: string]: UserStatus }>>
  onlineUsers: { [key: string]: UserStatus }
  receiverId: string
  toggleSidebar?: () => void
  isMobile?: boolean
}

export default function HeaderChat({
  onlineReceiver,
  setOnlineUsers,
  onlineUsers,
  receiverId,
  toggleSidebar,
  isMobile
}: HeaderChatProps) {
  const profile = JSON.parse(localStorage.getItem('profile') as string)

  useEffect(() => {
    socket.connect()
    if (profile._id) {
      socket.auth = {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        _id: profile._id
      }
    }

    socket.on('user_status_change', (data: UserStatus) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.user_id]: data
      }))
    })

    socket.on('all_online_users_response', (users) => {
      setOnlineUsers(users)
    })

    return () => {
      socket.off('user_status_change')
      socket.off('all_online_users_response')
    }
  }, [profile._id, setOnlineUsers])

  const { data: dataReceiver, isLoading } = useQuery({
    queryKey: ['receiver', receiverId],
    queryFn: () => apiUser.getProfileById(receiverId),
    enabled: !!receiverId && receiverId !== profile._id
  })

  const receiversData = dataReceiver?.data

  const formatLastActive = (date: Date) => {
    const lastActive = new Date(date)
    const now = new Date()
    const diffInMilliseconds = Math.abs(now.getTime() - lastActive.getTime())
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))

    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (isLoading) {
    return (
      <div className='py-3.5 px-6 bg-[#161b22] flex items-center justify-center h-16'>
        <div className='relative w-5 h-5'>
          <div className='absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin'></div>
        </div>
      </div>
    )
  }

  if (!receiverId || receiverId === profile._id) {
    return (
      <div className='py-3.5 px-6 bg-[#161b22] flex items-center h-16'>
        <div className='text-gray-400 text-sm font-medium'>Select a contact to start chatting</div>
      </div>
    )
  }

  return (
    <div className='bg-[#161b22] border-b border-[#30363d]'>
      {dataReceiver &&
        receiversData &&
        Array(receiversData).map((data: any) => (
          <motion.div
            key={data?.username}
            className='w-full py-2 px-4 flex items-center space-x-3 h-16'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMobile && toggleSidebar && (
              <button onClick={toggleSidebar} className='p-2 rounded-full hover:bg-[#24292f] mr-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  className='w-5 h-5 text-gray-400'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                </svg>
              </button>
            )}

            <div className='relative inline-flex items-center'>
              <div
                className={`absolute inset-0 rounded-full ${
                  onlineReceiver
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse-slow opacity-20'
                    : 'bg-transparent'
                }`}
              ></div>

              <div className='relative'>
                <Avatar className='h-10 w-10 border-2 border-[#30363d] bg-[#0d1117]'>
                  <AvatarImage src={data?.avatar || data?.cover_photo} className='object-cover' />
                  <AvatarFallback className='bg-[#1d2432] text-indigo-300'>{data?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                {onlineReceiver && (
                  <span className='absolute bottom-0 right-0 h-3 w-3'>
                    <span className='absolute inset-0 rounded-full bg-emerald-500 opacity-50 animate-ping-slow'></span>
                    <span className='relative inline-flex h-full w-full rounded-full bg-emerald-500 border-2 border-[#161b22]'></span>
                  </span>
                )}
              </div>
            </div>

            <div className='flex-1 ml-1'>
              <h3 className='text-sm font-medium text-gray-100'>{data?.name}</h3>
              <div className='flex items-center'>
                {onlineReceiver ? (
                  <p className='text-xs text-emerald-400'>Active now</p>
                ) : (
                  <p className='text-xs text-gray-400'>
                    {onlineUsers[receiverId] && onlineUsers[receiverId].last_active
                      ? `Last seen ${formatLastActive(onlineUsers[receiverId].last_active)}`
                      : 'Offline'}
                  </p>
                )}
              </div>
            </div>

            <div className='flex space-x-2'>
              <motion.button
                className='rounded-full p-2 hover:bg-[#24292f] text-gray-400 hover:text-gray-300 bg-black'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='w-5 h-5'
                >
                  <path d='M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'></path>
                </svg>
              </motion.button>
              <motion.button
                className='rounded-full p-2 hover:bg-[#24292f] text-gray-400 hover:text-gray-300 bg-black'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='w-5 h-5'
                >
                  <circle cx='12' cy='12' r='1'></circle>
                  <circle cx='12' cy='5' r='1'></circle>
                  <circle cx='12' cy='19' r='1'></circle>
                </svg>
              </motion.button>
            </div>
          </motion.div>
        ))}
    </div>
  )
}
