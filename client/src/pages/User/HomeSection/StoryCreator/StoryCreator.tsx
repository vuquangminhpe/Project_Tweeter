/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useContext } from 'react'
import { motion } from 'framer-motion'
import { X, Image, Video, Trash2, EyeOff, Check } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AppContext } from '@/Contexts/app.context'
import { MediaType } from '@/constants/enum'
import { toast } from 'sonner'
import storiesApi from '@/apis/stories.api'
import mediasApi from '@/apis/medias.api'
import { Button } from '@/Components/ui/button'
import { Label } from '@radix-ui/react-dropdown-menu'

interface StoryCreatorProps {
  onClose: () => void
}

const StoryCreator = ({ onClose }: StoryCreatorProps) => {
  const { profile } = useContext(AppContext)
  const [content, setContent] = useState('')
  const [caption, setCaption] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<MediaType | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImageMutation = useMutation({
    mutationFn: mediasApi.uploadImages,
    onSuccess: () => {},
    onError: (error) => {
      console.error('Failed to upload image:', error)
      toast.error('Failed to upload image')
    }
  })

  const uploadVideoMutation = useMutation({
    mutationFn: mediasApi.uploadVideo,
    onSuccess: () => {},
    onError: (error) => {
      console.error('Failed to upload video:', error)
      toast.error('Failed to upload video')
    }
  })

  const createStoryMutation = useMutation({
    mutationFn: (data: any) => storiesApi.createStory(data),
    onSuccess: () => {
      toast.success('Story created successfully')
      onClose()
    },
    onError: (error) => {
      console.error('Failed to create story:', error)
      toast.error('Failed to create story')
      setIsUploading(false)
    }
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit')
      return
    }

    setMediaFile(file)

    if (file.type.startsWith('image/')) {
      setMediaType(MediaType.Image)
    } else if (file.type.startsWith('video/')) {
      setMediaType(MediaType.Video)
    }

    const previewUrl = URL.createObjectURL(file)
    setMediaPreview(previewUrl)
  }

  const handleUploadClick = (type: 'image' | 'video') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*'
      fileInputRef.current.click()
    }
  }

  const handleClearMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview)
    }
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
  }

  const handleCreateStory = async () => {
    if (!content.trim()) {
      toast.error('Please add some content to your story')
      return
    }

    setIsUploading(true)

    try {
      let mediaUrl = ''
      let uploadedMediaType = mediaType

      if (mediaFile && mediaType !== null) {
        let uploadResult

        if (mediaType === MediaType.Image) {
          uploadResult = await uploadImageMutation.mutateAsync(mediaFile)
        } else if (mediaType === MediaType.Video) {
          uploadResult = await uploadVideoMutation.mutateAsync(mediaFile)
        }

        if (uploadResult?.data?.result?.[0]?.url) {
          mediaUrl = uploadResult.data.result[0].url
          uploadedMediaType = uploadResult.data.result[0].type
        }
      }

      const mediaTypeValue = uploadedMediaType ? String(uploadedMediaType) : undefined

      await createStoryMutation.mutateAsync({
        content,
        media_url: mediaUrl,
        media_type: mediaTypeValue,
        caption: caption || undefined,
        privacy: isPrivate ? [profile?._id] : []
      })
    } catch (error) {
      console.error('Error creating story:', error)
      toast.error('Failed to create story')
      setIsUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className='bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>Create Story</h2>
          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
          >
            <X className='w-5 h-5 text-gray-600 dark:text-gray-400' />
          </button>
        </div>

        <div className='p-4 overflow-y-auto max-h-[calc(90vh-120px)]'>
          <div className='flex items-center mb-4'>
            <Avatar className='h-10 w-10 mr-3'>
              <AvatarImage src={profile?.avatar} alt={profile?.username || 'User'} />
              <AvatarFallback className='bg-gradient-to-r from-violet-200 to-indigo-200 text-indigo-600'>
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='font-medium text-gray-900 dark:text-gray-100'>{profile?.name || profile?.username}</p>
              <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                {isPrivate ? (
                  <>
                    <EyeOff className='w-3 h-3 mr-1' />
                    <span>Only me</span>
                  </>
                ) : (
                  <span>Public</span>
                )}
              </div>
            </div>
          </div>

          {mediaPreview && (
            <div className='relative mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden'>
              <button
                onClick={handleClearMedia}
                className='absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors'
              >
                <Trash2 className='w-5 h-5 text-white' />
              </button>

              {mediaType === MediaType.Image && (
                <img src={mediaPreview} alt='Story preview' className='w-full rounded-lg object-contain max-h-[60vh]' />
              )}

              {mediaType === MediaType.Video && (
                <div className='aspect-video w-full'>
                  <video src={mediaPreview} className='w-full h-full rounded-lg object-contain' controls />
                </div>
              )}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className='w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[80px]'
              />
            </div>

            <div>
              <input
                type='text'
                placeholder='Add a caption (optional)'
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className='w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
            </div>
          </div>

          {!mediaPreview && (
            <div className='flex gap-2 mt-4'>
              <Button
                variant='outline'
                className='flex-1 flex items-center justify-center gap-2'
                onClick={() => handleUploadClick('image')}
              >
                <Image className='w-5 h-5' />
                <div className='text-black'>Photo</div>
              </Button>

              <Button
                variant='outline'
                className='flex-1 flex items-center justify-center gap-2'
                onClick={() => handleUploadClick('video')}
              >
                <Video className='w-5 h-5' />
                <div className='text-black'>Video</div>
              </Button>

              <input type='file' ref={fileInputRef} onChange={handleFileSelect} className='hidden' />
            </div>
          )}

          <div className='flex items-center justify-between mt-6 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg'>
            <div>
              <Label className='text-gray-900 dark:text-gray-100 font-medium'>Only visible to me</Label>
              <p className='text-xs text-gray-500 dark:text-gray-400'>If enabled, only you will see this story</p>
            </div>
            {/* <Switch id='story-privacy' checked={isPrivate} onCheckedChange={setIsPrivate} /> */}
          </div>
        </div>

        <div className='border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end'>
          <Button variant='ghost' onClick={onClose} className='mr-2' disabled={isUploading}>
            Cancel
          </Button>

          <Button
            onClick={handleCreateStory}
            disabled={isUploading || (!content.trim() && !mediaFile)}
            className='bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white'
          >
            {isUploading ? (
              <div className='flex items-center'>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Uploading...
              </div>
            ) : (
              <div className='flex items-center gap-1'>
                <Check className='w-4 h-4' />
                Share to Story
              </div>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default StoryCreator
