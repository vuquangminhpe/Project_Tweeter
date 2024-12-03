/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, ChangeEvent } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { CiImageOn } from 'react-icons/ci'
import { IoLocationSharp } from 'react-icons/io5'
import { CiFaceSmile } from 'react-icons/ci'
import { useQuery } from '@tanstack/react-query'
import apiUser from '@/apis/user.api'
import { getAccessTokenFromLS } from '@/utils/auth'
import TwitterCard from '../TwitterCard'

interface TweetFormValues {
  content: string
  image: File | string
}

const validationSchema = Yup.object().shape({
  content: Yup.string().required('Tweet text is required')
})

const HomeSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('forYou')
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)
  const [selectImage, setSelectImage] = useState<File | string>('')

  const handleSubmit = (values: TweetFormValues) => {
    console.log('value', values)
  }

  const formik = useFormik<TweetFormValues>({
    initialValues: {
      content: '',
      image: ''
    },
    onSubmit: handleSubmit,
    validationSchema
  })

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

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='flex justify-center'>
        <section className='flex space-x-0 w-full max-w-md'>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex-1 text-center cursor-pointer px-4 sm:px-6 py-3 sm:py-5 text-base sm:text-xl font-bold rounded-md transition-all duration-300 
              ${activeTab === tab.id ? 'text-white bg-gray-700 relative' : 'text-gray-500 hover:bg-gray-700/10'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && <div className='absolute bottom-0 left-0 w-full h-1 bg-blue-500'></div>}
            </div>
          ))}
        </section>
      </div>

      <div className='space-y-5 mt-4 sm:mt-6'>
        <section className='pb-6 sm:pb-10'>
          <div className='flex space-x-3 sm:space-x-5'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0'>
              <img
                src='https://anhtoc.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-2.webp'
                alt='Avatar'
                className='w-full h-full object-cover'
              />
            </div>

            <div className='w-full'>
              <form onSubmit={formik.handleSubmit}>
                <div>
                  <input
                    type='text'
                    placeholder='What is happening?'
                    className='w-full border-none outline-none text-base sm:text-xl bg-transparent'
                    {...formik.getFieldProps('content')}
                  />
                  {formik.errors.content && formik.touched.content && (
                    <span className='text-red-500 text-sm'>{formik.errors.content}</span>
                  )}
                </div>

                <div className='flex justify-between items-center mt-3 sm:mt-5'>
                  <div className='flex space-x-3 sm:space-x-5 items-center'>
                    <label className='flex items-center space-x-2 rounded-md cursor-pointer'>
                      <CiImageOn className='text-[#1d9bf0] text-xl sm:text-2xl' />
                      <input type='file' className='hidden' onChange={handleSelectImage} />
                    </label>
                    <IoLocationSharp className='text-[#1d9bf0] text-xl sm:text-2xl' />
                    <CiFaceSmile className='text-[#1d9bf0] text-xl sm:text-2xl' />
                  </div>
                  <div>
                    <button
                      className='rounded-full px-4 sm:px-6 py-1.5 sm:py-2 
                        bg-[#1e88e5] text-white hover:bg-[#1565c0] 
                        text-sm sm:text-base'
                      type='submit'
                    >
                      Post
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className='space-y-4 sm:space-y-6'>
          {[1, 1, 1, 1, 1].map((_, index) => (
            <TwitterCard key={index} />
          ))}
        </section>
      </div>
    </div>
  )
}

export default HomeSection
