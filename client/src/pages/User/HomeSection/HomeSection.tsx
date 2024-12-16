/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, ChangeEvent, useContext, useEffect, useCallback, useRef, useMemo } from 'react'
import { FormikHelpers, useFormik } from 'formik'
import * as Yup from 'yup'
import { CiImageOn } from 'react-icons/ci'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import TwitterCard from './TwitterCard'
import { AppContext } from '@/Contexts/app.context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import tweetsApi from '@/apis/tweets.api'
import mediasApi from '@/apis/medias.api'
import { Media } from '@/types/Medias.type'
import { TweetAudience, TweetType } from '@/constants/enum'
import apiUser from '@/apis/users.api'
import { createdTweet, TweetFormValues, Tweets } from '@/types/Tweet.type'

const validationSchema = Yup.object().shape({
  content: Yup.string().required('Tweet text is required'),
  images: Yup.array().max(4, 'You can upload maximum 4 files')
})
interface Props {
  isPendingTweet: boolean
  isTitleName: string
  customClassName?: string
  dataEdit: Tweets
}
const tabs = [
  { id: 'forYou', label: 'For You' },
  { id: 'following', label: 'Following' }
]
const HomeSection = ({ isPendingTweet = true, isTitleName = 'Post', customClassName, dataEdit }: Props) => {
  const [activeTab, setActiveTab] = useState<string>('forYou')
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)
  const [selectItemInTweet, setSelectItemInTweet] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<(string | ArrayBuffer)[]>([])
  const [allLinkCreatedTweet, setAllLinkCreatedTweet] = useState<Media[]>([])
  const [allIdWithMentionName, setAllIdWithMentionName] = useState<string[]>([])
  const [allIdWithMentionName_Undefined, setAllIdWithMentionName_Undefined] = useState<string[]>([])
  const { profile } = useContext(AppContext)
  const handleSubmit = async (values: TweetFormValues, { resetForm }: FormikHelpers<TweetFormValues>) => {
    try {
      const uploadedLinks = await handleUploadItems()
      setAllLinkCreatedTweet(uploadedLinks)

      if (isPendingTweet) {
        await handleCreatedTweet(values, uploadedLinks)
      } else {
        await handleEditTweet(values, [...dataEdit.medias, ...uploadedLinks])
      }
      resetForm({
        values: {
          _id: '',
          content: '',
          images: [],
          audience: TweetAudience.Everyone,
          hashtags: [],
          medias: [],
          mentions: [],
          currentHashtag: '',
          currentMention: '',
          type: TweetType.Tweet
        }
      })
      setImagePreviews([])
    } catch (error) {
      console.error('error', error)
    }
  }

  const formik = useFormik<TweetFormValues>({
    initialValues: {
      _id: !isPendingTweet ? dataEdit._id : '',
      content: !isPendingTweet ? dataEdit.content : '',
      images: [],
      audience: !isPendingTweet ? dataEdit.audience : TweetAudience.Everyone,
      hashtags: !isPendingTweet ? (dataEdit.hashtag_info as any[]) : [],
      medias: !isPendingTweet ? [] : allLinkCreatedTweet,
      mentions: !isPendingTweet ? (dataEdit?.mention_info as unknown as string[]) : [],
      currentHashtag: '',
      currentMention: '',
      type: TweetType.Tweet
    },
    onSubmit: handleSubmit,
    validationSchema
  })

  const {
    data: dataTweets,
    isLoading: isLoadingAllDataTweet,
    refetch: refetchAllDataTweet
  } = useQuery({
    queryKey: ['dataTweets'],
    queryFn: tweetsApi.getAllTweets
  })
  const allTweets = dataTweets?.data?.data
  useEffect(() => {
    const convertMentionsToIds = async () => {
      if (formik.values.mentions.length > 0) {
        try {
          const userIds = await Promise.all(
            formik.values.mentions.map(async (username) => {
              try {
                const userData = await apiUser.getProfileByUserName(username)
                if (!userData?.data?._id) {
                  setAllIdWithMentionName_Undefined((prev) => [...prev, username])
                }
                console.log('userData:', userData?.data?._id)

                return userData?.data?._id
              } catch (error) {
                console.error(`Error fetching user for username: ${username}`, error)
                setAllIdWithMentionName_Undefined((prev) => [...prev, username])
                return undefined
              }
            })
          )

          const validUserIds = userIds.filter((_id) => _id !== undefined) as unknown as string[]
          setAllIdWithMentionName(validUserIds)
        } catch (error) {
          console.error('Error converting mentions to user IDs:', error)
        }
      } else {
        setAllIdWithMentionName([])
      }
    }

    convertMentionsToIds()
  }, [formik.values.mentions])
  const createdTweetMutation = useMutation({
    mutationFn: tweetsApi.createTweet,
    onMutate: () => {
      setUploadingImage(true)
    },
    onSuccess: (data) => {
      console.log('tạo tweet thành công:', data)
      refetchAllDataTweet()
    },
    onError: (error) => {
      console.error('tạo tweet thất bại:', error)
    },
    onSettled: () => {
      setUploadingImage(false)
    }
  })
  const editTweetMutation = useMutation({
    mutationFn: (body: createdTweet) => tweetsApi.updateTweets(body),
    onMutate: () => {
      setUploadingImage(true)
    },
    onSuccess: (data) => {
      console.log('edit tweet thành công:', data)
      refetchAllDataTweet()
    },
    onError: (error) => {
      console.error('edit tweet thất bại:', error)
    },
    onSettled: () => {
      setUploadingImage(false)
    }
  })
  const uploadImagesMutation = useMutation({
    mutationFn: mediasApi.uploadImages,
    onMutate: () => {
      setUploadingImage(true)
    },
    onSuccess: (data) => {
      console.log('Upload images thành công:', data)
    },
    onError: (error) => {
      console.error('Upload images thất bại:', error)
    },
    onSettled: () => {
      setUploadingImage(false)
    }
  })
  const uploadVideoMutation = useMutation({
    mutationFn: mediasApi.uploadVideo,
    onMutate: () => {
      setUploadingImage(true)
    },
    onSuccess: (data) => {
      console.log('Upload video thành công:', data)
    },
    onError: (error) => {
      console.error('Upload video thất bại:', error)
    },
    onSettled: () => {
      setUploadingImage(false)
    }
  })

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      setSelectItemInTweet(fileArray)
      const previews = fileArray.map((file) => URL.createObjectURL(file))
      setImagePreviews(previews)

      formik.setFieldValue('images', fileArray)
    }
  }

  const handleUploadItems = async () => {
    if (selectItemInTweet.length > 0) {
      try {
        const uploadedFiles = await Promise.all(
          selectItemInTweet.map(async (item) => {
            console.log('item:', item)

            if (item.type.startsWith('image/')) {
              return await uploadImagesMutation.mutateAsync(item)
            } else if (item.type.startsWith('video/') || item.type.startsWith('application/x-mpegurl')) {
              return await uploadVideoMutation.mutateAsync(item)
            } else {
              console.warn(`Skipping file with unsupported type: ${item.type}`)
              return null
            }
          })
        )

        const successfulUploads = uploadedFiles.filter(Boolean)
        const uploadedLinks = successfulUploads.flatMap((item) =>
          (item as any)?.data.result.map((i: any) => ({
            url: i.url,
            type: i.type
          }))
        )

        return uploadedLinks
      } catch (error) {
        console.error('error:', error)
        return []
      }
    } else {
      console.warn('no data to upload')
      return []
    }
  }

  const addHashtag = () => {
    const newHashtag = formik.values.currentHashtag.trim()
    if (newHashtag && !formik.values.hashtags.includes(newHashtag)) {
      formik.setFieldValue('hashtags', [...formik.values.hashtags, newHashtag])
      formik.setFieldValue('currentHashtag', '')
    }
  }
  const addMention = () => {
    const newMention = formik.values.currentMention.trim()
    if (newMention && !formik.values.mentions.includes(newMention)) {
      formik.setFieldValue('mentions', [...formik.values.mentions, newMention])
      formik.setFieldValue('currentMention', '')
    }
  }
  const handleCreatedTweet = useCallback(
    async (data: TweetFormValues, uploadedLinks: Media[]) => {
      await createdTweetMutation.mutateAsync({
        content: data.content,
        medias: uploadedLinks,
        type: formik.values.type,
        parent_id: null,
        hashtags: data.hashtags,
        mentions: allIdWithMentionName,
        audience: data.audience
      })
    },
    [allIdWithMentionName, createdTweetMutation, formik.values.type]
  )
  const handleEditTweet = useCallback(
    async (data: TweetFormValues, uploadedLinks: Media[]) => {
      await editTweetMutation.mutateAsync({
        _id: dataEdit._id,
        content: data.content,
        medias: uploadedLinks,
        type: formik.values.type,
        parent_id: null,
        hashtags: data.hashtags,
        mentions: allIdWithMentionName,
        audience: data.audience
      })
    },
    [allIdWithMentionName, editTweetMutation, formik.values.type, dataEdit?._id]
  )
  if (isLoadingAllDataTweet) {
    return (
      <div role='status'>
        <svg
          aria-hidden='true'
          className='inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
          viewBox='0 0 100 101'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
            fill='currentColor'
          />
          <path
            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
            fill='currentFill'
          />
        </svg>
        <span className='sr-only'>Loading...</span>
      </div>
    )
  }

  return (
    <div className={`${isPendingTweet ? 'container' : 'w-full'} mx-auto px-4 py-6 bg-white shadow-sm rounded-xl`}>
      {isPendingTweet && (
        <div className={`mb-6 ${customClassName}`}>
          <div className='flex justify-center bg-gray-50 rounded-lg p-1'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 py-3 text-sm md:text-base font-semibold transition-all duration-300 
              ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white rounded-md shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {activeTab === tab.id && <div className='w-full h-1 bg-blue-400 mt-2 rounded-b-full'></div>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`bg-gray-50 rounded-xl p-4 shadow-inner ${isPendingTweet ? 'mb-6' : 'w-full'}`}>
        <div className='flex items-start space-x-4'>
          <Avatar className='w-12 h-12 border-2 border-blue-100'>
            <AvatarImage src={profile?.avatar} alt={profile?.name} className='object-cover rounded-full' />
            <AvatarFallback className='bg-blue-100 text-blue-600'>
              {profile?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1'>
            <form onSubmit={formik.handleSubmit}>
              <textarea
                placeholder="What's happening?"
                className='w-full min-h-[100px] p-3 bg-white border border-gray-200 
                rounded-lg focus:ring-2 focus:ring-blue-200 
                resize-none transition-all duration-300'
                {...formik.getFieldProps('content')}
              />
              {formik.errors.content && formik.touched.content && (
                <p className='text-red-500 text-sm mt-2'>{formik.errors.content}</p>
              )}

              {imagePreviews.length > 0 && (
                <div className='grid grid-cols-3 gap-4 mt-4'>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className='relative'>
                      {typeof preview === 'string' && (
                        <img src={preview} alt={`Preview ${index}`} className='w-full h-48 object-cover rounded-xl' />
                      )}
                      <button
                        type='button'
                        onClick={() => {
                          const newPreviews = [...imagePreviews]
                          const newImages = [...selectItemInTweet]
                          newPreviews.splice(index, 1)
                          newImages.splice(index, 1)
                          setImagePreviews(newPreviews)
                          setSelectItemInTweet(newImages)
                          formik.setFieldValue('images', newImages)
                        }}
                        className='absolute top-2 right-2 bg-black/50 text-white 
          rounded-full p-1 hover:bg-black/70 transition'
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className='flex justify-between items-center mt-4'>
                <div className='flex space-x-4 text-blue-600'>
                  <label className='cursor-pointer hover:text-blue-800 transition'>
                    <CiImageOn className='text-2xl' />
                    <input
                      type='file'
                      className='hidden'
                      multiple
                      accept='image/*,video/*'
                      onChange={handleImageSelect}
                    />
                  </label>
                  <Popover>
                    <PopoverTrigger>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='size-6'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5'
                        />
                      </svg>
                    </PopoverTrigger>
                    <PopoverContent>
                      <input
                        type='text'
                        value={formik.values.currentHashtag}
                        onChange={formik.handleChange}
                        name='currentHashtag'
                        className='bg-gray-100 rounded-xl w-full px-1 py-3 mb-3'
                      />
                      <div
                        onClick={addHashtag}
                        className='capitalize bg-gray-100 rounded-xl p-1 cursor-pointer font-semibold w-32 text-center'
                      >
                        add hash tag
                      </div>
                      <div className='mt-4 flex flex-wrap gap-2'>
                        {formik?.values?.hashtags?.map((hashtag, index) => {
                          console.log('hashtag:', hashtag)

                          return (
                            <span
                              key={index}
                              className='bg-blue-500 text-white px-2 py-1 rounded-full text-sm flex items-center'
                            >
                              #{!isPendingTweet ? (hashtag as any).name : hashtag}
                              <button
                                onClick={() => {
                                  const newHashtags = formik.values.hashtags.filter((_, i) => i !== index)
                                  formik.setFieldValue('hashtags', newHashtags)
                                }}
                                className='ml-2 text-black hover:text-red-300'
                              >
                                ×
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='size-6'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25'
                        />
                      </svg>
                    </PopoverTrigger>
                    <PopoverContent>
                      <input
                        type='text'
                        value={formik.values.currentMention}
                        onChange={formik.handleChange}
                        name='currentMention'
                        className='bg-gray-100 rounded-xl w-full px-1 py-3 mb-3'
                      />
                      <div
                        onClick={addMention}
                        className='capitalize bg-gray-100 rounded-xl p-1 cursor-pointer font-semibold w-32 text-center'
                      >
                        add mention
                      </div>
                      <div className='mt-4 flex flex-wrap gap-2'>
                        {formik?.values?.mentions?.map((mention, index) => {
                          console.log('mention:', mention)

                          const isValid = allIdWithMentionName_Undefined.includes(mention)

                          return (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded-full text-sm flex items-center ${
                                !isValid ? 'bg-green-300 text-black' : 'bg-gray-300 text-gray-600'
                              }`}
                            >
                              <div className='hidden'>{(mention as any)?.username}</div>
                              <div className={`text-${isValid ? 'black' : 'gray-400'}`}>
                                @{!isPendingTweet ? (mention as any).username : mention}
                              </div>
                              <button
                                onClick={() => {
                                  const newMentions = formik.values.mentions.filter((_, i) => i !== index)

                                  formik.setFieldValue('mentions', newMentions)
                                }}
                                className='ml-2 text-black hover:text-red-300'
                              >
                                ×
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='size-6'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z'
                        />
                        <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
                      </svg>
                    </PopoverTrigger>
                    <PopoverContent className='bg-gray-100 rounded-xl max-w-40 px-1 py-3 mb-3'>
                      <div className='flex items-center'>
                        <input
                          type='radio'
                          value={1}
                          checked={formik.values.audience === 1}
                          name='audience'
                          className='bg-gray-100 rounded-xl mr-1'
                          onChange={() => formik.setFieldValue('audience', 1)}
                        />
                        <label>Everyone</label>
                      </div>
                      <div className='flex items-center'>
                        <input
                          type='radio'
                          value={0}
                          checked={formik.values.audience === 0}
                          name='audience'
                          className='bg-gray-100 rounded-xl mr-1'
                          onChange={() => formik.setFieldValue('audience', 0)}
                        />
                        <label>Tweet Circle</label>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <button
                  type='submit'
                  className='bg-blue-600 text-white px-6 py-2 rounded-full 
                  hover:bg-blue-700 transition-colors duration-300 
                  focus:outline-none focus:ring-2 focus:ring-blue-400'
                >
                  {isTitleName}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {isPendingTweet && (
        <div className='mt-6 space-y-4'>
          {allTweets?.map((data) =>
            Array(data).map((element, index) => (
              <TwitterCard
                refetchAllDataTweet={refetchAllDataTweet}
                key={`${element._id}-${index}`}
                data={element}
                data_length={data?.medias?.length}
                profile={profile}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default HomeSection
