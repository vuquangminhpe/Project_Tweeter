/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import conversationsApi from '@/apis/conversation.api'
import axios from 'axios'

interface UserStatus {
  user_id: string
  is_online: boolean
  last_active: Date
}

interface StatusWithChatProps {
  statusOnline: boolean
  onReceiverChange: (receiverId: string) => void
  onlineUsers: { [key: string]: UserStatus }
}

export default function StatusWithChat({ onReceiverChange, statusOnline }: StatusWithChatProps) {
  const { data: dataFollowers } = useQuery({
    queryKey: ['followers'],
    queryFn: () => conversationsApi.getAllConversationsWithFollower(10, 1)
  })
  const allData = dataFollowers?.data?.result

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
    <div className='h-full flex flex-col'>
      <div className='p-4 border-b border-gray-200'>
        <input
          type='text'
          placeholder='Search messages'
          className='w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      <div className='flex-1 overflow-y-auto'>
        {allData?.map((data) =>
          Array(data.users_follower_info).map((user: any) => (
            <button
              key={user.username}
              onClick={() => getProfile(user.username)}
              className='w-full p-2 hover:bg-gray-100 transition-colors flex items-center space-x-3'
            >
              <div className='relative'>
                <Avatar className='h-12 w-12'>
                  <AvatarImage src={user.avatar || user.cover_photo} />
                  <AvatarFallback className='text-black bg-white'>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {statusOnline && (
                  <span className='absolute bottom-0 right-0 h-3 w-3'>
                    <span className='absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping'></span>
                    <span className='relative inline-flex h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
                  </span>
                )}
              </div>

              <div className='flex-1 flex flex-col items-start'>
                <span className='font-medium text-gray-900'>{user.name}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
