import { IoSparkles } from 'react-icons/io5'
import Input from './Input'
import Post from '../../../../components/Post'
import { useState, ChangeEvent, useContext, useEffect, useCallback } from 'react'
import { FormikHelpers, useFormik } from 'formik'
import * as Yup from 'yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AppContext } from '@/Contexts/app.context'
import tweetsApi from '@/apis/tweets.api'
import mediasApi from '@/apis/medias.api'
import { Media } from '@/types/Medias.type'
import { TweetAudience, TweetType } from '@/constants/enum'
import apiUser from '@/apis/users.api'
import { createdTweet, TweetFormValues, Tweets } from '@/types/Tweet.type'
import { toast } from 'sonner'
import useNotifications from '@/components/Customs/Notification/useNotifications/useNotifications'
import { ActionType } from '@/types/Notifications.types'

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

function Feed({ setEdit, isPendingTweet = true, isTitleName = 'Share', customClassName, dataEdit }: Props) {
  const [activeTab, setActiveTab] = useState('For you')
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

  return (
    <div className='text-white flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px]'>
      <div
        className='text-[#d9d9d9] flex items-center sm:justify-between py-2 px-3 sticky top-0 z-50 
      bg-black border-b border-gray-700'
      >
        <h2 className='text-lg sm:text-xl font-bold'>Home</h2>
        <div className='hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0 ml-auto'>
          <IoSparkles />
        </div>
      </div>

      {/* Tabs */}
      <div className='flex items-center justify-center sticky top-0 z-50 bg-black border-b border-gray-700'>
        <div
          className={`relative flex-1 text-center py-3 cursor-pointer transition duration-300 ${
            activeTab === 'For you' ? 'text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'
          }`}
          onClick={() => setActiveTab('For you')}
        >
          For you
          {activeTab === 'For you' && (
            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80px] border-b-4 border-[#1D9BF0]'></div>
          )}
        </div>
        <div
          className={`relative flex-1 text-center py-3 cursor-pointer transition duration-300 ${
            activeTab === 'Following' ? 'text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'
          }`}
          onClick={() => setActiveTab('Following')}
        >
          Following
          {activeTab === 'Following' && (
            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80px] border-b-4 border-[#1D9BF0]'></div>
          )}
        </div>
      </div>

      <Input />
      <div className='pb-72'>
        {isLoadingAllDataTweet ? (
          <div className='flex justify-center items-center min-h-[200px]'>
            <div className='animate-pulse flex space-x-2'>
              <div className='h-3 w-3 bg-indigo-400 rounded-full'></div>
              <div className='h-3 w-3 bg-indigo-500 rounded-full'></div>
              <div className='h-3 w-3 bg-indigo-600 rounded-full'></div>
            </div>
          </div>
        ) : (
          <div>
            <Post />
            <Post />
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed
