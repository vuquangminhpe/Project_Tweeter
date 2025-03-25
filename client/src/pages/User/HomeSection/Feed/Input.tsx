import { XIcon } from 'lucide-react'
import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react'
import { IoMdPhotos } from 'react-icons/io'
import { HiChartBar } from 'react-icons/hi'
import { VscMention } from 'react-icons/vsc'
import { BsEmojiKissFill } from 'react-icons/bs'
import { FaRegCalendarCheck } from 'react-icons/fa6'
import { IoIosSettings } from 'react-icons/io'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { FaUserTag } from 'react-icons/fa'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AppContext } from '@/Contexts/app.context'
import { FormikHelpers, useFormik } from 'formik'
import { createdTweet, TweetFormValues, Tweets } from '@/types/Tweet.type'
import { Media } from '@/types/Medias.type'
import { useMutation } from '@tanstack/react-query'
import tweetsApi from '@/apis/tweets.api'
import mediasApi from '@/apis/medias.api'
import { ActionType } from '@/types/Notifications.types'
import { toast } from 'react-toastify'
import useNotifications from '@/components/Customs/Notification/useNotifications/useNotifications'
import * as Yup from 'yup'
import { TweetAudience, TweetType } from '@/constants/enum'
import apiUser from '@/apis/users.api'

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

function Input({ setEdit, isPendingTweet = true, dataEdit }: Props) {
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState()
  const filePickerRef = useRef(null)
  const [showEmoji, setShowEmoji] = useState(false)

  const [uploadingImage, setUploadingImage] = useState<boolean>(false)
  const [selectItemInTweet, setSelectItemInTweet] = useState<File[]>([])
  const [allLinkCreatedTweet, setAllLinkCreatedTweet] = useState<Media[]>([])
  const [allIdWithMentionName, setAllIdWithMentionName] = useState<string[]>([])
  const [allIdWithMentionName_Undefined, setAllIdWithMentionName_Undefined] = useState<string[]>([])
  const { profile } = useContext(AppContext)
  const [imagePreviews, setImagePreviews] = useState<(string | ArrayBuffer)[]>([])

  console.log(imagePreviews.map((item) => item))

  const handleSubmit = async (values: TweetFormValues, { resetForm }: FormikHelpers<TweetFormValues>) => {
    try {
      const uploadedLinks = await handleUploadItems()
      setAllLinkCreatedTweet(uploadedLinks)

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

  const addEmoji = (e: { unified: string }) => {
    const sym = e.unified.split('-')
    const codesArray = sym.map((el) => `0x${el}`)
    const emoji = String.fromCodePoint(...codesArray)
    setInput(input + emoji)
  }

  const addImageToPost = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      setSelectItemInTweet(fileArray)
      const previews = fileArray.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...previews])
      formik.setFieldValue('images', fileArray)
    }
  }



  return (
    <div className={`border-b border-gray-700 p-3 flex space-x-3`}>
      <Avatar className='h-11 w-11 rounded-full cursor-pointer'>
        <AvatarImage src={profile?.avatar} alt={profile?.name || 'User'} />
        <AvatarFallback className='bg-gradient-to-r from-violet-200 to-indigo-200 text-indigo-600'>
          {profile?.name?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className='w-full divide-y divide-gray-700'>
        <form onSubmit={formik.handleSubmit}>
          <div className={``}>
            <textarea
              {...formik.getFieldProps('content')}
              placeholder="What's happening?"
              rows={2}
              className='bg-transparent outline-none 
            text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px] overflow-hidden'
            />
            <div className='flex flex-row overflow-x-auto gap-1'>
              {imagePreviews.length > 0 &&
                imagePreviews.map((preview, index) => (
                  <div key={index} className='relative'>
                    <div
                      className='absolute w-8 h-8 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 
        rounded-full flex items-center justify-center top-1 left-1 cursor-pointer'
                      onClick={() => setImagePreviews((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <XIcon className='text-white h-5' />
                    </div>
                    {typeof preview === 'string' && (
                      <img src={preview} alt='' className='rounded-2xl max-h-80 object-contain' />
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className='flex items-center justify-between pt-2.5'>
            <div className='flex items-center'>
              <div className='icon cursor-pointer' onClick={() => filePickerRef.current?.click()}>
                <IoMdPhotos className='h-[22px] text-[#1d9bf0]' />
                <input
                  multiple
                  accept='image/*,video/*'
                  type='file'
                  onChange={addImageToPost}
                  ref={filePickerRef}
                  hidden
                />
              </div>
              <div className='icon'>
                <VscMention size={25} className='h-[22px] text-[#1d9bf0]' />
              </div>
              <div className='icon'>
                <FaUserTag className='h-[22px] text-[#1d9bf0]' />
              </div>
              <div className='icon'>
                <BsEmojiKissFill
                  size={15}
                  onClick={() => setShowEmoji(!showEmoji)}
                  className='h-[22px] text-[#1d9bf0]'
                />
              </div>
              <div className='icon'>
                <IoIosSettings size={20} className='h-[22px] text-[#1d9bf0]' />
              </div>
            </div>
            <button
              className='bg-[#1d9bf0] text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-[#1a8cd8]
           disabled:hover:bg-[1d9bf0] disabled:opacity-50 disabled:cursor-default'
              disabled={!formik.values.content.trim() && !selectedFile}
              type='submit'
            >
              Post
            </button>
          </div>
        </form>
        {showEmoji && (
          <div className='relative'>
            <Picker
              theme='auto'
              data={data}
              onEmojiSelect={addEmoji}
              style={{
                position: 'absolute',
                bottom: '50px',
                left: '0px',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                width: '300px'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Input
