/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, ChangeEvent, useContext, useEffect, useCallback } from 'react'
import { FormikHelpers, useFormik } from 'formik'
import * as Yup from 'yup'
import { BiImageAlt, BiHash, BiAt, BiCog } from 'react-icons/bi'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import PostCard from './TwitterCard'
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

  if (isLoadingAllDataTweet) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <div className='animate-pulse flex space-x-2'>
          <div className='h-3 w-3 bg-indigo-400 rounded-full'></div>
          <div className='h-3 w-3 bg-indigo-500 rounded-full'></div>
          <div className='h-3 w-3 bg-indigo-600 rounded-full'></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isPendingTweet ? 'container' : 'w-full'} mx-auto bg-white rounded-xl shadow-sm overflow-hidden`}>
      {isPendingTweet && (
        <div className={`${customClassName}`}>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='w-full p-0 h-12 bg-gray-50 rounded-none border-b'>
              <TabsTrigger
                value='forYou'
                className='flex-1 h-full data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600'
              >
                For You
              </TabsTrigger>
              <TabsTrigger
                value='following'
                className='flex-1 h-full data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600'
              >
                Following
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className={`p-4 bg-white border-b ${isPendingTweet ? '' : 'w-full'}`}>
        <div className='flex items-start gap-4'>
          <Avatar className='w-10 h-10 border border-gray-200'>
            <AvatarImage src={profile?.avatar} alt={profile?.name} />
            <AvatarFallback className='bg-gradient-to-r from-violet-200 to-indigo-200 text-indigo-600'>
              {profile?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1'>
            <form onSubmit={formik.handleSubmit}>
              <textarea
                placeholder="Share what's on your mind..."
                className='w-full min-h-[100px] p-4 bg-gray-50 border border-gray-200 
                rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300
                resize-none transition-all duration-200'
                {...formik.getFieldProps('content')}
              />

              {formik.errors.content && formik.touched.content && (
                <p className='text-red-500 text-sm mt-2'>{formik.errors.content}</p>
              )}

              {imagePreviews.length > 0 && (
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4'>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className='relative rounded-lg overflow-hidden'>
                      {typeof preview === 'string' && (
                        <img src={preview} alt={`Preview ${index}`} className='w-full h-36 object-cover' />
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
                        className='absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className='flex justify-between items-center mt-4'>
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

                  <div className='relative flex items-center justify-center w-8 h-8 flex-shrink-0'>
          <Orb
            hoverIntensity={0.3} // Giảm intensity để phù hợp kích thước nhỏ
            rotateOnHover={true}
            hue={120} // Màu mặc định
            forceHoverState={false}
          
          />
        </div>

                  <Popover>
                    <PopoverTrigger className='flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition'>
                      <BiHash className='text-xl' />
                      <span className='text-sm'>Tags</span>
                    </PopoverTrigger>
                    <PopoverContent className='w-72 p-4 rounded-lg'>
                      <h3 className='text-sm font-medium mb-2'>Add tags to your post</h3>
                      <div className='flex gap-2 mb-3'>
                        <input
                          type='text'
                          value={formik.values.currentHashtag}
                          onChange={formik.handleChange}
                          name='currentHashtag'
                          placeholder='Enter tag name'
                          className='flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm'
                        />
                        <button
                          type='button'
                          onClick={addHashtag}
                          className='bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition'
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
                                className='bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs flex items-center'
                              >
                                #{!isPendingTweet ? (hashtag as any).name : hashtag}
                                <button
                                  type='button'
                                  onClick={() => {
                                    const newHashtags = formik.values.hashtags.filter((_, i) => i !== index)
                                    formik.setFieldValue('hashtags', newHashtags)
                                  }}
                                  className='ml-1 text-indigo-400 hover:text-indigo-700'
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
                    <PopoverContent className='w-72 p-4 rounded-lg'>
                      <h3 className='text-sm font-medium mb-2'>Mention people</h3>
                      <div className='flex gap-2 mb-3'>
                        <input
                          type='text'
                          value={formik.values.currentMention}
                          onChange={formik.handleChange}
                          name='currentMention'
                          placeholder='Enter username'
                          className='flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm'
                        />
                        <button
                          type='button'
                          onClick={addMention}
                          className='bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition'
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
                                    isValid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  @{!isPendingTweet ? (mention as any).username : mention}
                                  <button
                                    type='button'
                                    onClick={() => {
                                      const newMentions = formik.values.mentions.filter((_, i) => i !== index)
                                      formik.setFieldValue('mentions', newMentions)
                                    }}
                                    className={`ml-1 ${isValid ? 'text-green-400 hover:text-green-700' : 'text-gray-400 hover:text-gray-700'}`}
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
                    <PopoverContent className='w-64 p-4 rounded-lg'>
                      <h3 className='text-sm font-medium mb-3'>Who can see this post?</h3>
                      <div className='space-y-3'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='radio'
                            value={1}
                            checked={formik.values.audience === 1}
                            name='audience'
                            className='accent-indigo-600'
                            onChange={() => formik.setFieldValue('audience', 1)}
                          />
                          <div>
                            <div className='text-sm font-medium'>Everyone</div>
                            <div className='text-xs text-gray-500'>Any user can see this post</div>
                          </div>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='radio'
                            value={0}
                            checked={formik.values.audience === 0}
                            name='audience'
                            className='accent-indigo-600'
                            onChange={() => formik.setFieldValue('audience', 0)}
                          />
                          <div>
                            <div className='text-sm font-medium'>Circle Only</div>
                            <div className='text-xs text-gray-500'>Only people in your circle can see</div>
                          </div>
                        </label>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <button
                  type='submit'
                  disabled={uploadingImage}
                  className='bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2 rounded-lg
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

      {isPendingTweet && (allTweets?.length ?? 0) > 0 && (
        <div className='divide-y'>
          {allTweets?.map((data) =>
            Array(data).map((element, index) => (
              <PostCard
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

      {isPendingTweet && (!allTweets || allTweets.length === 0) && (
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
          <h3 className='text-lg font-medium text-gray-900 mb-1'>No posts yet</h3>
          <p className='text-gray-500 mb-6'>Be the first to share something with your circle</p>
        </div>
      )}
    </div>
  )
}

export default HomeSection
