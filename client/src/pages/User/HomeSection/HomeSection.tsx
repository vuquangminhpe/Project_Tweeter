/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, ChangeEvent, useContext, useEffect, useCallback } from 'react'
import { FormikHelpers, useFormik } from 'formik'
import * as Yup from 'yup'
import { BiImageAlt, BiHash, BiAt, BiCog } from 'react-icons/bi'
import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IoIosArrowDown } from 'react-icons/io'

import PostCard from './TwitterCard/TwitterCard'
import { AppContext } from '@/Contexts/app.context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import tweetsApi from '@/apis/tweets.api'
import mediasApi from '@/apis/medias.api'
import { Media } from '@/types/Medias.type'
import { TweetAudience, TweetType } from '@/constants/enum'
import apiUser from '@/apis/users.api'
import { createdTweet, TweetFormValues, Tweets } from '@/types/Tweet.type'
import { toast } from 'sonner'
import useNotifications from '@/components/Customs/Notification/useNotifications/useNotifications'
import { ActionType } from '@/types/Notifications.types'
import Orb from '@/components/ui/orb'
import { FaTimes } from 'react-icons/fa'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'

const validationSchema = Yup.object().shape({
  content: Yup.string().required('Post text is required'),
  images: Yup.array().max(4, 'You can upload maximum 4 files')
})

interface Props {
  isPendingTweet: boolean
  isTitleName: string
  customClassName?: string
  dataEdit: Tweets
  setEdit: React.Dispatch<React.SetStateAction<boolean>>
}

const HomeSection = ({ setEdit, isPendingTweet = true, isTitleName = 'Share', customClassName, dataEdit }: Props) => {
  const [activeTab, setActiveTab] = useState<string>('forYou')
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)
  const [selectItemInTweet, setSelectItemInTweet] = useState<File[]>([])
  const [contentWithGenerateAi, setContentWithGenerateAi] = useState<string>('')
  const [imagePreviews, setImagePreviews] = useState<(string | ArrayBuffer)[]>([])
  const [allLinkCreatedTweet, setAllLinkCreatedTweet] = useState<Media[]>([])
  const [allIdWithMentionName, setAllIdWithMentionName] = useState<string[]>([])
  const [allIdWithMentionName_Undefined, setAllIdWithMentionName_Undefined] = useState<string[]>([])
  const { profile } = useContext(AppContext)
  const [isGeneratingTweet, setIsGeneratingTweet] = useState<boolean>(false)

  const handleSubmit = async (values: TweetFormValues, { resetForm }: FormikHelpers<TweetFormValues>) => {
    try {
      const uploadedLinks = await handleUploadItems()
      setAllLinkCreatedTweet(uploadedLinks)

      if (isPendingTweet) {
        await handleCreatedTweet(values, uploadedLinks)
      } else {
        setEdit(false)
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

  const { createNotification } = useNotifications({ userId: profile?._id || '' })

  const formik = useFormik<TweetFormValues>({
    initialValues: {
      _id: !isPendingTweet ? dataEdit._id : '',
      content: !isPendingTweet ? dataEdit.content : '',
      images: [],
      audience: !isPendingTweet ? dataEdit.audience : TweetAudience.Everyone,
      hashtags: !isPendingTweet ? (dataEdit?.hashtag_info as any[]) : [],
      medias: !isPendingTweet ? allLinkCreatedTweet : [],
      mentions: !isPendingTweet ? (dataEdit?.mention_info as unknown as string[]) : [],
      currentHashtag: '',
      currentMention: '',
      type: TweetType.Tweet
    },
    onSubmit: handleSubmit,
    validationSchema
  })

  const {
    data: myTweets,
    isLoading: isLoadingMyTweets,
    refetch: refetchMyTweets
  } = useQuery({
    queryKey: ['myTweets'],
    queryFn: tweetsApi.getAllTweets
  })

  // Replace the regular query with infinite query
  const {
    data: newFeedsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingNewFeeds,
    refetch: refetchNewFeeds
  } = useInfiniteQuery({
    queryKey: ['newFeeds'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await tweetsApi.getNewFeeds(pageParam, 10)
      return response.data
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length
      return currentPage < lastPage.total_pages ? currentPage + 1 : undefined
    },
    initialPageParam: 1
  })

  // Flatten tweets from all pages
  const newFeedTweets = newFeedsData?.pages.flatMap((page) => page.results) || []

  const refetchAllDataTweet = useCallback(() => {
    refetchMyTweets()
    refetchNewFeeds()
  }, [refetchMyTweets, refetchNewFeeds])

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
    onSuccess: () => {
      refetchAllDataTweet()
    },
    onError: (error) => {
      console.error('Failed to create post:', error)
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
    onSuccess: () => {
      refetchAllDataTweet()
    },
    onError: (error) => {
      console.error('Failed to edit post:', error)
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
    onSuccess: () => {},
    onError: (error) => {
      console.error('Failed to upload images:', error)
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
    onSuccess: () => {},
    onError: (error) => {
      console.error('Failed to upload video:', error)
    },
    onSettled: () => {
      setUploadingImage(false)
    }
  })

  // const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
  //   const files = event.target.files
  //   if (files) {
  //     const fileArray = Array.from(files)
  //     setSelectItemInTweet(fileArray)
  //     const previews = fileArray.map((file) => URL.createObjectURL(file))
  //     setImagePreviews(previews)
  //     formik.setFieldValue('images', fileArray)
  //   }
  //   console.log(formik.getFieldProps('images'))
  // }

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)

      setSelectItemInTweet((prev) => [...prev, ...fileArray])

      const previews = fileArray.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...previews])

      formik.setFieldValue('images', [...formik.values.images, ...fileArray])
    }
  }

  const handleUploadItems = async () => {
    if (selectItemInTweet.length > 0) {
      console.log('Uploading files:', selectItemInTweet)
      try {
        const uploadedFiles = await Promise.all(
          selectItemInTweet.map(async (item) => {
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
      await createdTweetMutation.mutateAsync(
        {
          content: data.content,
          medias: uploadedLinks,
          type: formik.values.type,
          parent_id: null,
          hashtags: data.hashtags,
          mentions: allIdWithMentionName,
          audience: data.audience
        },
        {
          onSuccess: () => {
            createNotification({
              recipientId: profile?._id || '',
              actionType: ActionType.TWEET,
              targetId: allIdWithMentionName as unknown as string[],
              content: `${profile?.name || profile?.username} mentioned you in a post`
            })
            toast.success('Post shared successfully')
            refetchAllDataTweet()
          },
          onError: (error) => {
            console.error('Failed to create post:', error)
            toast.error('Failed to share post')
          }
        }
      )
    },
    [
      allIdWithMentionName,
      createNotification,
      createdTweetMutation,
      formik.values.type,
      profile?._id,
      profile?.name,
      profile?.username,
      refetchAllDataTweet
    ]
  )

  const handleEditTweet = useCallback(
    async (data: TweetFormValues, uploadedLinks: Media[]) => {
      await editTweetMutation.mutateAsync({
        _id: dataEdit._id,
        content: data.content,
        medias: uploadedLinks,
        type: formik.values.type,
        parent_id: null,
        hashtags: data.hashtags.map((hashtag) => (hashtag as any).name || hashtag),
        mentions: allIdWithMentionName,
        audience: data.audience
      })
    },
    [allIdWithMentionName, editTweetMutation, formik.values.type, dataEdit?._id]
  )

  const generateAITweetMutation = useMutation({
    mutationFn: (message: string) => tweetsApi.generateTweetWithAi({ message }),
    onMutate: () => {
      setIsGeneratingTweet(true)
    },
    onSuccess: (response) => {
      // The API response has a nested structure
      if (response.data?.data?.data) {
        const aiGeneratedTweet = response.data.data.data

        // Update form content with AI-generated content
        formik.setFieldValue('content', aiGeneratedTweet.content)
        setContentWithGenerateAi(aiGeneratedTweet.content)

        // Process hashtags - remove # prefix if present
        if (aiGeneratedTweet.hashtags && aiGeneratedTweet.hashtags.length > 0) {
          const formattedHashtags = aiGeneratedTweet.hashtags.map((tag: string) =>
            tag.startsWith('#') ? tag.substring(1) : tag
          )
          formik.setFieldValue('hashtags', formattedHashtags)
        }

        toast.success('AI tweet generated!')
      }
    },
    onError: (error) => {
      console.error('Failed to generate AI tweet:', error)
      toast.error('Failed to generate AI tweet')
    },
    onSettled: () => {
      setIsGeneratingTweet(false)
    }
  })

  const handleAIGeneration = async () => {
    const defaultMessage = 'Hôm nay của tôi'
    const message = formik.values.content.trim() || defaultMessage

    try {
      await generateAITweetMutation.mutateAsync(message)
    } catch (error) {
      console.error('Error in handleAIGeneration:', error)
    }
  }

  return (
    <div className=' text-white flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px]'>
      {isPendingTweet && (
        <div className={`${customClassName}`}>
          <div className='flex items-center justify-center sticky top-0 z-50 bg-black border-b border-gray-700'>
            <div
              className={`relative flex-1 text-center py-3 cursor-pointer transition duration-300 ${
                activeTab === 'forYou' ? 'text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => setActiveTab('forYou')}
            >
              For you
              {activeTab === 'forYou' && (
                <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80px] border-b-4 border-[#1D9BF0]'></div>
              )}
            </div>
            <div
              className={`relative flex-1 text-center py-3 cursor-pointer transition duration-300 ${
                activeTab === 'myTweet' ? 'text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => setActiveTab('myTweet')}
            >
              My Tweet
              {activeTab === 'myTweet' && (
                <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80px] border-b-4 border-[#1D9BF0]'></div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`p-4 bg-black border-b border-gray-700 ${isPendingTweet ? '' : 'w-full'}`}>
        <div className='border-b border-gray-700 p-3 flex space-x-3'>
          <Avatar className='h-11 w-11 rounded-full cursor-pointer'>
            <AvatarImage src={profile?.avatar} alt={profile?.name} />
            <AvatarFallback className='bg-gradient-to-r from-violet-200 to-indigo-200 text-indigo-600'>
              {profile?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className='w-full divide-y divide-gray-700'>
            <form onSubmit={formik.handleSubmit}>
              <textarea
                placeholder="Share what's on your mind..."
                className='bg-transparent outline-none 
            text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px] overflow-hidden'
                {...formik.getFieldProps('content')}
              />

              {formik.errors.content && formik.touched.content && (
                <p className='text-red-500 text-sm mt-2'>{formik.errors.content}</p>
              )}

              {imagePreviews.length > 0 && (
                <div className='flex flex-row overflow-x-auto gap-1'>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className='relative'>
                      {typeof preview === 'string' && (
                        <img src={preview} alt={`Preview ${index}`} className='rounded-2xl max-h-80 object-contain' />
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
                        className='absolute w-8 h-8 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 
        rounded-full flex items-center justify-center top-1 left-1 cursor-pointer'
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className='flex items-center justify-between pt-2.5'>
                <div className='flex space-x-4'>
                  <label className='cursor-pointer text-gray-600 hover:text-indigo-600 transition flex items-center gap-1'>
                    <BiImageAlt className='text-xl' />
                    <span className='text-sm'>Media</span>
                    <input
                      type='file'
                      className='hidden'
                      multiple
                      accept='image/*,video/*'
                      onChange={handleImageSelect}
                    />
                  </label>

                  {/* AI Generation Orb */}
                  <div
                    className='relative flex items-center justify-center w-8 h-8 flex-shrink-0 cursor-pointer'
                    onClick={handleAIGeneration}
                  >
                    <Orb hoverIntensity={0.3} rotateOnHover={true} hue={120} forceHoverState={isGeneratingTweet} />
                    {isGeneratingTweet && (
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent'></div>
                      </div>
                    )}
                  </div>

                  <Popover>
                    <PopoverTrigger className='flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition'>
                      <BiHash className='text-xl' />
                      <span className='text-sm'>Tags</span>
                    </PopoverTrigger>
                    <PopoverContent className='w-72 p-4 rounded-lg bg-gray-800 text-white shadow-xl'>
                      <h3 className='text-sm font-medium mb-2'>Add tags to your post</h3>
                      <div className='flex gap-2 mb-3'>
                        <input
                          type='text'
                          value={formik.values.currentHashtag}
                          onChange={formik.handleChange}
                          name='currentHashtag'
                          placeholder='Enter tag name'
                          className='flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400'
                        />
                        <button
                          type='button'
                          onClick={addHashtag}
                          className='bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition'
                        >
                          Add
                        </button>
                      </div>
                      {formik.values.hashtags.length > 0 && (
                        <div className='mt-3'>
                          <div className='text-sm font-medium mb-2'>Your tags:</div>
                          <div className='flex flex-wrap gap-2'>
                            {formik?.values?.hashtags?.map((hashtag: any, index: any) => (
                              <span
                                key={index}
                                className='bg-indigo-700 text-white px-2 py-1 rounded-full text-xs flex items-center'
                              >
                                #{!isPendingTweet ? (hashtag as any).name : hashtag}
                                <button
                                  type='button'
                                  onClick={() => {
                                    const newHashtags = formik.values.hashtags.filter((_, i) => i !== index)
                                    formik.setFieldValue('hashtags', newHashtags)
                                  }}
                                  className='ml-1 text-indigo-300 hover:text-indigo-500'
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger className='flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition'>
                      <BiAt className='text-xl' />
                      <span className='text-sm'>Mention</span>
                    </PopoverTrigger>
                    <PopoverContent className='w-72 p-4 rounded-lg bg-gray-800 text-white shadow-xl'>
                      <h3 className='text-sm font-medium mb-2'>Mention people</h3>
                      <div className='flex gap-2 mb-3'>
                        <input
                          type='text'
                          value={formik.values.currentMention}
                          onChange={formik.handleChange}
                          name='currentMention'
                          placeholder='Enter username'
                          className='flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400'
                        />
                        <button
                          type='button'
                          onClick={addMention}
                          className='bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition'
                        >
                          Add
                        </button>
                      </div>
                      {formik.values.mentions.length > 0 && (
                        <div className='mt-3'>
                          <div className='text-sm font-medium mb-2'>People you mentioned:</div>
                          <div className='flex flex-wrap gap-2'>
                            {formik?.values?.mentions?.map((mention: any, index: any) => {
                              const isValid = !allIdWithMentionName_Undefined.includes(mention)
                              return (
                                <span
                                  key={index}
                                  className={`px-2 py-1 rounded-full text-xs flex items-center ${
                                    isValid ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-400'
                                  }`}
                                >
                                  @{!isPendingTweet ? (mention as any).username : mention}
                                  <button
                                    type='button'
                                    onClick={() => {
                                      const newMentions = formik.values.mentions.filter((_, i) => i !== index)
                                      formik.setFieldValue('mentions', newMentions)
                                    }}
                                    className={`ml-1 ${
                                      isValid
                                        ? 'text-green-300 hover:text-green-500'
                                        : 'text-gray-400 hover:text-gray-500'
                                    }`}
                                  >
                                    ×
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger className='flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition'>
                      <BiCog className='text-xl' />
                      <span className='text-sm'>Privacy</span>
                    </PopoverTrigger>
                    <PopoverContent className='w-64 p-4 rounded-lg bg-gray-800 text-white shadow-xl'>
                      <h3 className='text-sm font-medium mb-3'>Who can see this post?</h3>
                      <div className='space-y-3'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='radio'
                            value={1}
                            checked={formik.values.audience === 1}
                            name='audience'
                            className='accent-indigo-500'
                            onChange={() => formik.setFieldValue('audience', 1)}
                          />
                          <div>
                            <div className='text-sm font-medium'>Everyone</div>
                            <div className='text-xs text-gray-400'>Any user can see this post</div>
                          </div>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='radio'
                            value={0}
                            checked={formik.values.audience === 0}
                            name='audience'
                            className='accent-indigo-500'
                            onChange={() => formik.setFieldValue('audience', 0)}
                          />
                          <div>
                            <div className='text-sm font-medium'>Circle Only</div>
                            <div className='text-xs text-gray-400'>Only people in your circle can see</div>
                          </div>
                        </label>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <button
                  type='submit'
                  disabled={uploadingImage}
                  className='mx-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2 rounded-lg
                  font-medium hover:from-violet-700 hover:to-indigo-700 transition-colors duration-200 
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-70'
                >
                  {uploadingImage ? 'Sharing...' : isTitleName}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className='pb-72'>
        {activeTab === 'forYou' ? (
          isLoadingNewFeeds && !newFeedsData ? (
            <div className='flex justify-center items-center min-h-[200px]'>
              <div className='animate-pulse flex space-x-2'>
                <div className='h-3 w-3 bg-indigo-400 rounded-full'></div>
                <div className='h-3 w-3 bg-indigo-500 rounded-full'></div>
                <div className='h-3 w-3 bg-indigo-600 rounded-full'></div>
              </div>
            </div>
          ) : isPendingTweet && newFeedTweets.length > 0 ? (
            <>
              <div>
                {newFeedTweets.map((element, index) => (
                  <PostCard
                    refetchAllDataTweet={refetchAllDataTweet}
                    key={`${element._id}-${index}`}
                    data={element}
                    data_length={element?.medias?.length}
                    profile={profile}
                  />
                ))}

                {/* {newFeedTweets.map((element) => console.log(element))} */}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className='flex justify-center my-4'>
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className='flex items-center px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:opacity-50'
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load More'}
                    <IoIosArrowDown className='ml-2' />
                  </button>
                </div>
              )}

              {/* Loading More Indicator */}
              {isFetchingNextPage && (
                <div className='flex justify-center items-center my-4'>
                  <div className='animate-pulse text-gray-500'>Fetching more tweets...</div>
                </div>
              )}
            </>
          ) : (
            <div className='py-12 px-4 text-center'>
              <div className='bg-indigo-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-8 w-8 text-indigo-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-1'>No posts in your feed</h3>
              <p className='text-gray-500 mb-6'>Follow more people to see their posts</p>
            </div>
          )
        ) : isLoadingMyTweets ? (
          <div className='flex justify-center items-center min-h-[200px]'>
            <div className='animate-pulse flex space-x-2'>
              <div className='h-3 w-3 bg-indigo-400 rounded-full'></div>
              <div className='h-3 w-3 bg-indigo-500 rounded-full'></div>
              <div className='h-3 w-3 bg-indigo-600 rounded-full'></div>
            </div>
          </div>
        ) : isPendingTweet && (myTweets?.data?.data?.length ?? 0) > 0 ? (
          <div>
            {myTweets.data.data.map((element, index) => (
              <PostCard
                refetchAllDataTweet={refetchAllDataTweet}
                key={`${element._id}-${index}`}
                data={element}
                data_length={element?.medias?.length}
                profile={profile}
              />
            ))}
          </div>
        ) : (
          <div className='py-12 px-4 text-center'>
            <div className='bg-indigo-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-indigo-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-1'>You haven't posted yet</h3>
            <p className='text-gray-500 mb-6'>Share something to see your tweets here</p>
          </div>
        )}
      </div>

      {/* Remove the old conditional rendering for empty tweets */}
    </div>
  )
}

export default HomeSection
