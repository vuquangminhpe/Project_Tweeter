/* eslint-disable @typescript-eslint/no-explicit-any */
import socket from '@/utils/socket'
import React, { useEffect } from 'react'
import { UserStatus } from '../Chat'
import apiUser from '@/apis/users.api'
import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'

interface HeaderChatProps {
  onlineReceiver: boolean
  setOnlineUsers: React.Dispatch<React.SetStateAction<{ [key: string]: UserStatus }>>
  onlineUsers: { [key: string]: UserStatus }
  receiverId: string
}
export default function HeaderChat({ onlineReceiver, setOnlineUsers, onlineUsers, receiverId }: HeaderChatProps) {
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
      console.log('HeaderChat received status change:', data)
      setOnlineUsers((prev) => ({
        ...prev,
        [data.user_id]: data
      }))
    })

    socket.on('all_online_users_response', (users) => {
      console.log('HeaderChat received online users:', users)
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
    return <div className='py-2 px-4'>Loading chat header...</div>
  }

  if (!receiverId || receiverId === profile._id) {
    return <div className='py-2 px-4 text-center font-medium'>Select a contact to start chatting</div>
  }

  return (
    <div className=''>
      {dataReceiver &&
        receiversData &&
        Array(receiversData).map((data: any) => (
          <button
            key={data?.username}
            className='w-full p-2 hover:bg-gray-100 transition-colors flex items-center space-x-3'
          >
            <div className='relative inline-block'>
              {/* Border animation container */}
              <div
                className={`absolute inset-0 rounded-full ${
                  onlineReceiver ? 'bg-gradient-to-r from-[#3F5EFB] to-[#FC466B] animate-spin-slow' : 'bg-gray-300'
                }`}
              ></div>

              {/* Padding container for border effect */}
              <div className='relative p-[2px]'>
                {' '}
                {/* Adjust padding to control border thickness */}
                {/* Avatar container */}
                <div className='relative rounded-full bg-white p-[2px]'>
                  <Avatar className='h-10 w-10 rounded-full overflow-hidden'>
                    <AvatarImage src={data?.avatar || data?.cover_photo} className='rounded-full object-cover' />
                    <AvatarFallback className='text-black bg-white rounded-full'>
                      {data?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            <div className='flex-1 ml-3'>
              <h3 className='text-sm font-semibold'>{data?.name}</h3>
              <p className='text-xs text-gray-500'>{data?.username}</p>
              {!onlineReceiver && onlineUsers[receiverId] && (
                <span className='text-xs text-gray-500'>
                  Last seen {formatLastActive(onlineUsers[receiverId].last_active)}
                </span>
              )}
            </div>
          </button>
        ))}
    </div>
  )
}
