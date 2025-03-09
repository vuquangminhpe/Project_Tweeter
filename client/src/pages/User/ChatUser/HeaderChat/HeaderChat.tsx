/* eslint-disable @typescript-eslint/no-explicit-any */
import socket from '@/utils/socket'
import React, { useEffect } from 'react'
import { UserStatus } from '../Chat'
import apiUser from '@/apis/users.api'
import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    socket.emit('get_all_online_users')

    socket.on('user_status_change', (data: UserStatus) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.user_id]: data
      }))
    })

    socket.on('all_online_users_response', (users: { [key: string]: UserStatus }) => {
      setOnlineUsers(users)
    })

    return () => {
      socket.off('user_status_change')
      socket.off('all_online_users_response')
    }
  }, [profile._id, setOnlineUsers])
  const { data: dataReceiver } = useQuery({
    queryKey: ['receiver', receiverId],
    queryFn: () => apiUser.getProfileById(receiverId)
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
  return (
    <div className=''>
    {dataReceiver &&
      Array(receiversData).map((data: any) => (
        <button
          key={data?.username}
          className='w-full p-2 hover:bg-gray-100 transition-colors flex items-center space-x-3'
        >
          <div className='relative inline-block'>
            {/* Online indicator */}
            {onlineReceiver && (
              <span className='absolute bottom-0 right-0 h-3 w-3 z-10'>
                <span className='absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping'></span>
                <span className='relative inline-flex h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
              </span>
            )}
            
            {/* Avatar with circular style */}
            <div className='relative'>
              <Avatar className='w-12 h-12 rounded-full overflow-hidden'>
                <AvatarImage 
                  className="rounded-full" 
                  src={data?.avatar} 
                  alt={data?.username} 
                />
                <AvatarFallback className='bg-gray-800 text-gray-400 rounded-full flex items-center justify-center'>
                  {(data?.name || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
  
          <div className='flex-1 ml-3'>
            <h3 className='text-sm font-semibold'>{data?.name}</h3>
            <p className='text-xs text-gray-500'>{data?.username}</p>
            {!onlineReceiver && onlineUsers[receiverId]?.last_active && (
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
