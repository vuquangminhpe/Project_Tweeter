/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, ChangeEvent } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { CiImageOn } from 'react-icons/ci'
import { IoLocationSharp } from 'react-icons/io5'
import { CiFaceSmile } from 'react-icons/ci'

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
    <div>
      <div className='flex justify-center'>
        <section className='flex space-x-0'>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`cursor-pointer px-10 py-5 text-xl font-bold rounded-md transition-all duration-300 gap-0 
              ${activeTab === tab.id ? 'text-white bg-gray-700 relative' : 'text-gray-500 hover:bg-gray-700'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && <div className='absolute bottom-0 left-0 w-full h-1 bg-blue-500'></div>}
            </div>
          ))}
        </section>
      </div>
      <div className='space-y-5'>
        <section className={`pb-10`}>
          <div className='flex space-x-5'>
            <div className='w-12 h-12 rounded-full overflow-hidden'>
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
                    placeholder='What is happening'
                    className={`border-none outline-none text-xl bg-transparent`}
                    {...formik.getFieldProps('content')}
                  />
                  {formik.errors.content && formik.touched.content && (
                    <span className='text-red-500'>{formik.errors.content}</span>
                  )}
                </div>
                <div className='flex justify-between items-center mt-5'>
                  <div className='flex space-x-5 items-center'>
                    <label className='flex items-center space-x-2 rounded-md cursor-pointer'>
                      <CiImageOn className='text-[#1d9bf0]' />
                      <input type='file' className='hidden' onChange={handleSelectImage} />
                    </label>
                    <IoLocationSharp className='text-[#1d9bf0]' />
                    <CiFaceSmile className='text-[#1d9bf0]' />
                  </div>
                  <div>
                    <button
                      className='w-full rounded-[25px] py-2 bg-[#1e88e5] text-white hover:bg-[#1565c0] text-base'
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
      </div>
    </div>
  )
}

export default HomeSection
