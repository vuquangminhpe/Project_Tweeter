/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tweets } from '@/types/Tweet.type'
import { User } from '@/types/User.type'
import { SuccessResponse } from '@/types/Utils.type'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'

interface Props {
  profile: User | null
  data: Tweets
  refetchAllDataTweet: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<AxiosResponse<SuccessResponse<Tweets[]>, any>, Error>>
}

export default function EditTweet({ profile, data, refetchAllDataTweet }: Props) {
  return (
    <div className='bg-gray-50 rounded-xl p-4 shadow-inner'>
      <div className='flex items-start space-x-4'>
        <Avatar className='w-12 h-12 border-2 border-blue-100'>
          <AvatarImage src={profile?.avatar} alt={profile?.name} className='object-cover rounded-full' />
          <AvatarFallback className='bg-blue-100 text-blue-600'>
            {profile?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div key={data._id}>
          <button
            type='button'
            className='absolute top-2 right-2 bg-black/50 text-white 
rounded-full p-1 hover:bg-black/70 transition'
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
