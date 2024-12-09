/* eslint-disable @typescript-eslint/no-explicit-any */
import mediasApi from '@/apis/medias.api'
import VideoHLSPlayer from '@/components/Customs/VideoHLSPlayer'
import { MediaType } from '@/constants/enum'
import { Tweets } from '@/types/Tweet.type'
import { User } from '@/types/User.type'
import { SuccessResponse } from '@/types/Utils.type'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { QueryObserverResult, RefetchOptions, useMutation } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { useState } from 'react'

interface Props {
  profile: User | null
  data: Tweets
  refetchAllDataTweet: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<AxiosResponse<SuccessResponse<Tweets[]>, any>, Error>>
}

export default function EditTweet({ profile, data, refetchAllDataTweet }: Props) {
  const [editContentValue, SetEditContentValue] = useState<string>(data.content)
  const handleDeletedS3Mutation = useMutation({
    mutationFn: (s3_link: string) => mediasApi.deleteS3(s3_link)
  })
  const handleDeletedItemInTweetMutation = async (s3_link: string) => {
    await handleDeletedS3Mutation.mutateAsync(s3_link, {
      onSuccess: () => {
        console.log('deleted')
      },
      onError: (error) => {
        console.log(error)
      }
    })
  }
  return (
    <div className='bg-gray-50 rounded-xl p-4 shadow-inner'>
      <div className='flex items-start flex-col space-x-4'>
        <input type='text' value={editContentValue} onChange={(e) => SetEditContentValue(e.currentTarget.value)} />
        <div key={data._id}>
          <div className='mt-5 flex flex-col w-full'>
            <div className='w-full'>
              {data?.medias?.map((media) => (
                <div key={media.url} className='relative w-full'>
                  {media.type === MediaType.Image ? (
                    <div className='grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-2 max-sm:grid-cols-1'>
                      <img src={media.url} alt='media' className='w-40 h-40 object-cover rounded-lg' />
                    </div>
                  ) : (
                    <VideoHLSPlayer src={media.url} />
                  )}
                  <button
                    onClick={() => handleDeletedItemInTweetMutation(media.url)}
                    type='button'
                    className='absolute top-0 bg-gray-500 text-white 
  rounded-full p-1 hover:bg-black/70 transition-all duration-300'
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
