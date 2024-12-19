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
import HomeSection from '../HomeSection'

interface Props {
  profile: User | null
  data: Tweets
  setEdit: React.Dispatch<React.SetStateAction<boolean>>
  refetchAllDataTweet: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<AxiosResponse<SuccessResponse<Tweets[]>, any>, Error>>
}

export default function EditTweet({ data, refetchAllDataTweet, setEdit }: Props) {
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
      <div className='flex flex-col space-y-4'>
        <div key={data._id}>
          <div className='mt-5 flex flex-col w-full'>
            <div className='w-full'>
              <div className='text-lg font-semibold mb-4'>Old Medias</div>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {data?.medias?.map((media) => (
                  <div key={media.url} className='relative'>
                    {media.type === MediaType.Image ? (
                      <img
                        src={media.url}
                        alt='media'
                        className='w-full h-48 object-cover rounded-xl shadow-2xl transition-transform hover:scale-105'
                      />
                    ) : (
                      <div className='w-full h-48 relative'>
                        <VideoHLSPlayer classNames='w-full h-full' src={media.url} />
                      </div>
                    )}
                    <button
                      onClick={() => handleDeletedItemInTweetMutation(media.url)}
                      type='button'
                      className='absolute top-2 right-2 bg-gray-500/70 text-white 
                        rounded-full p-1 hover:bg-black/70 transition-all duration-300 
                        opacity-0 group-hover:opacity-100 focus:opacity-100'
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <HomeSection
                setEdit={setEdit}
                customClassName={'w-full mt-6'}
                isPendingTweet={false}
                isTitleName='Save'
                dataEdit={data}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
