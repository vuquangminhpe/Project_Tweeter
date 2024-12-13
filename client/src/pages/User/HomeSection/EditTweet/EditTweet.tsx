/* eslint-disable @typescript-eslint/no-explicit-any */
import mediasApi from '@/apis/medias.api'
import VideoHLSPlayer from '@/components/Customs/VideoHLSPlayer'
import { MediaType } from '@/constants/enum'
import { Tweets } from '@/types/Tweet.type'
import { User } from '@/types/User.type'
import { SuccessResponse } from '@/types/Utils.type'
import { convertS3Url } from '@/utils/utils'
import { QueryObserverResult, RefetchOptions, useMutation } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { useState } from 'react'
import HomeSection from '../HomeSection'

interface Props {
  profile: User | null
  data: Tweets
  refetchAllDataTweet: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<AxiosResponse<SuccessResponse<Tweets[]>, any>, Error>>
}

export default function EditTweet({ data, refetchAllDataTweet }: Props) {
  const [editContentValue, SetEditContentValue] = useState<string>(data.content)
  const handleDeletedS3Mutation = useMutation({
    mutationFn: ({ url, link }: { url: string; link: string }) => mediasApi.deleteS3({ url, link })
  })
  const handleDeletedItemInTweetMutation = async (url: string) => {
    const newUrl = convertS3Url(url)
    const addLinkDeletedFromS3 = !url.endsWith('/master.m3u8') ? url : newUrl + '/'

    try {
      await handleDeletedS3Mutation.mutateAsync(
        { url: addLinkDeletedFromS3, link: url },
        {
          onSuccess: () => {
            refetchAllDataTweet()
            console.log('deleted')
          },
          onError: (error) => {
            console.log(error)
          }
        }
      )
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className='bg-gray-50 rounded-xl p-4 shadow-inner'>
      <div className='flex items-start flex-col space-x-4'>
        <input type='text' value={editContentValue} onChange={(e) => SetEditContentValue(e.currentTarget.value)} />
        <div key={data._id}>
          <div className='mt-5 flex flex-col w-full'>
            <div className='w-full'>
              <div>Old Medias</div>
              {data?.medias?.map((media) => (
                <div key={media.url} className='relative w-full'>
                  {media.type === MediaType.Image ? (
                    <div className='grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-2 max-sm:grid-cols-1'>
                      <img src={media.url} alt='media' className=' w-40 h-40 object-cover rounded-lg' />
                    </div>
                  ) : (
                    <VideoHLSPlayer classNames='my-3' src={media.url} />
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
              <HomeSection customClassName={'w-full'} isPendingTweet={false} isTitleName='Save' dataEdit={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
