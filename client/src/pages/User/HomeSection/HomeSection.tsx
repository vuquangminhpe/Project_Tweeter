/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, ChangeEvent, useContext } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { CiImageOn } from 'react-icons/ci'
import { useQuery } from '@tanstack/react-query'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import TwitterCard from './TwitterCard'
import { AppContext } from '@/Contexts/app.context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import tweetsApi from '@/apis/tweets.api'

interface TweetFormValues {
  content: string
  images: File[]
}

const validationSchema = Yup.object().shape({
  content: Yup.string().required('Tweet text is required'),
  images: Yup.array().max(4, 'You can upload maximum 4 files')
})

const HomeSection = () => {
  const { profile } = useContext(AppContext)
  const {
    data: dataTweets,
    isLoading: isLoadingAllDataTweet,
    refetch: refetchAllDataTweet
  } = useQuery({
    queryKey: ['dataTweets'],
    queryFn: tweetsApi.getAllTweets
  })
  const allTweets = dataTweets?.data?.data

  const [activeTab, setActiveTab] = useState<string>('forYou')
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)
  const [selectImages, setSelectImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<(string | ArrayBuffer)[]>([])

  const [selectImage, setSelectImage] = useState<File | string>('')

  const handleSubmit = (values: TweetFormValues) => {
    console.log('value', values)
  }
  console.log(allTweets)

  const formik = useFormik<TweetFormValues>({
    initialValues: {
      content: '',
      images: []
    },
    onSubmit: handleSubmit,
    validationSchema
  })
  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadingImage(true)
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)

      setSelectImages(fileArray)

      const previews: (string | ArrayBuffer)[] = []
      fileArray.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          previews.push(reader.result as any)
          if (previews.length === fileArray.length) {
            setImagePreviews(previews)
          }
        }
        reader.readAsDataURL(file)
      })

      formik.setFieldValue('image', fileArray)
    }
    setUploadingImage(false)
  }
  const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadingImage(true)
    const imgFile = event.target.files?.[0]
    if (imgFile) {
      formik.setFieldValue('image', imgFile)
      setSelectImage(imgFile)
    }
    setUploadingImage(false)
  }

  const tabs = [
    { id: 'forYou', label: 'For You' },
    { id: 'following', label: 'Following' }
  ]
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
    <div className='container mx-auto px-4 py-6 bg-white shadow-sm rounded-xl'>
      <div className='mb-6'>
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

      <div className='bg-gray-50 rounded-xl p-4 shadow-inner'>
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
                          const newImages = [...selectImages]
                          newPreviews.splice(index, 1)
                          newImages.splice(index, 1)
                          setImagePreviews(newPreviews)
                          setSelectImages(newImages)
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
                    <PopoverContent className='bg-gray-400 rounded-xl'>
                      <input type='text' className='bg-gray-100 rounded-xl w-full px-1 py-3 mb-3' />
                      <div className='capitalize bg-gray-100 rounded-xl p-1 cursor-pointer font-semibold w-32 text-center'>
                        add hash tag
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
                    <PopoverContent className='bg-gray-400 rounded-xl'>
                      <input type='text' className='bg-gray-100 rounded-xl w-full px-1 py-3 mb-3' />
                      <div className='capitalize bg-gray-100 rounded-xl p-1 cursor-pointer font-semibold w-32 text-center'>
                        add mention
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
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className='mt-6 space-y-4'>
        {allTweets?.map((data) =>
          Array(data).map((element, index) => (
            <TwitterCard
              refetchAllDataTweet={refetchAllDataTweet}
              key={`${element._id}-${index}`}
              data={element}
              profile={profile}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default HomeSection
