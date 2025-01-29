/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import socket from '@/utils/socket'
import { Profile } from '@/types/User.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { useQuery } from '@tanstack/react-query'
import conversationsApi from '@/apis/conversation.api'
import axios from 'axios'

interface UserStatus {
  user_id: string
  is_online: boolean
  last_active: Date
}

interface StatusWithChatProps {
  onReceiverChange: (receiverId: string) => void
  onlineUsers: { [key: string]: UserStatus }
  setOnlineUsers: React.Dispatch<React.SetStateAction<{ [key: string]: UserStatus }>>
}

export default function StatusWithChat({ onReceiverChange, onlineUsers, setOnlineUsers }: StatusWithChatProps) {
  const profile = JSON.parse(localStorage.getItem('profile') as string) as Profile
  const { data: dataFollowers } = useQuery({
    queryKey: ['followers'],
    queryFn: () => conversationsApi.getAllConversationsWithFollower(10, 1)
  })
  const allData = dataFollowers?.data?.result

  useEffect(() => {
    if (profile._id) {
      socket.auth = {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        _id: profile._id
      }
    }
    socket.connect()
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

  const getProfile = async (username: string) => {
    try {
      const response = await axios.get<{ _id: string }>(`/users/${username}`, {
        baseURL: import.meta.env.VITE_API_URL
      })
      onReceiverChange(response.data._id)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  return (
    <div className='flex w-full h-full'>
      <div className='w-full'>
        <Carousel className='relative'>
          <CarouselContent className='flex'>
            {allData?.map((data) =>
              Array(data.users_follower_info).map((user: any) => (
                <CarouselItem key={user.username} className='w-full basis-1/9 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2'>
                  <button
                    onClick={() => getProfile(user.username)}
                    className='w-full h-full flex flex-col bg-blue-900 items-center justify-center p-4 hover:bg-blue-600'
                  >
                    <div className='flex items-center space-x-2'>
                      <Avatar className='w-12 h-12 sm:w-16 sm:h-16'>
                        <AvatarImage src={user.avatar || user.cover_photo} />
                        <AvatarFallback className='text-black bg-white rounded-full'>
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-sm sm:text-base font-medium truncate text-white'>
                        {user.name.slice(0, 5)}
                      </span>
                    </div>

                    {onlineUsers[user._id] ? (
                      <div className='mt-2 text-xs sm:text-sm'>
                        {onlineUsers[user._id].is_online ? (
                          <div className='flex items-center space-x-1'>
                            <span className='relative flex h-2 w-2'>
                              <span className='absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping'></span>
                              <span className='relative inline-flex h-2 w-2 rounded-full bg-green-500'></span>
                            </span>
                          </div>
                        ) : (
                          <span className='text-gray-200 text-[11px]'>
                            {`Last seen ${formatLastActive(onlineUsers[user._id].last_active)}`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className='mt-2 text-xs sm:text-sm'>
                        <span className='text-gray-200 text-[11px]'>
                          {`Last seen ${formatLastActive(user.last_active !== null ? new Date(user.last_active) : new Date())}`}
                        </span>
                      </div>
                    )}
                  </button>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <div className='absolute -left-4 top-1/2 -translate-y-1/2'>
            <CarouselPrevious className='hidden sm:flex h-8 w-8 sm:h-10 sm:w-10' />
          </div>
          <div className='absolute -right-4 top-1/2 -translate-y-1/2'>
            <CarouselNext className='hidden sm:flex h-8 w-8 sm:h-10 sm:w-10' />
          </div>
        </Carousel>
      </div>
    </div>
  )
}
