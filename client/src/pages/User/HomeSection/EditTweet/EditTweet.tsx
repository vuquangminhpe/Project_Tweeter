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
    <div className='edit-tweet-container w-full max-w-full overflow-hidden'>
      <div className='flex flex-col space-y-4'>
        <div key={data._id}>
          <div className='mt-5 flex flex-col w-full'>
            {data?.medias?.length > 0 && (
              <div className='w-full mb-4'>
                <div className='flex flex-row overflow-x-auto gap-1'>
                  {data?.medias?.map((media) => (
                    <div key={media.url} className='relative'>
                      {media.type === MediaType.Image ? (
                        <img
                          src={media.url}
                          alt='media'
                          className='rounded-2xl max-h-80 object-contain'
                        />
                      ) : (
                        <div className='w-full h-48 relative'>
                          <VideoHLSPlayer classNames='rounded-2xl max-h-80 object-contain' src={media.url} />
                        </div>
                      )}
                      <button
                        onClick={() => handleDeletedItemInTweetMutation(media.url)}
                        type='button'
                        className='absolute w-8 h-8 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 
                            rounded-full flex items-center justify-center top-1 left-1 cursor-pointer'
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className='w-full'>
              <HomeSection
                setEdit={setEdit}
                customClassName='edit-mode'
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
