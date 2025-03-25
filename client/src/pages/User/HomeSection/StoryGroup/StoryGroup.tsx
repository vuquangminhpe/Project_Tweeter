import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NewsFeedStory } from '@/apis/stories.api'

interface StoryGroupProps {
  user: {
    _id: string
    name?: string
    username: string
    avatar?: string
  }
  stories: NewsFeedStory[]
  isViewed: boolean
  onSelect: () => void
}

const StoryGroup = ({ user, stories, isViewed, onSelect }: StoryGroupProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    const storyWithMedia = stories.find((story) => story.media_url)

    if (storyWithMedia) {
      setPreviewImage(storyWithMedia.media_url)
    } else {
      setPreviewImage(null)
    }
  }, [stories])

  const displayName = user.name || user.username
  const shortName = displayName.split(' ')[0]

  const pulseAnimation = !isViewed
    ? {
        scale: [1, 1.05, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse' as const
        }
      }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0.6, y: 10 }}
      animate={{ opacity: 1, y: 0, ...pulseAnimation }}
      whileHover={{ scale: 1.05 }}
      className='flex flex-col z-[99999] items-center space-y-1 cursor-pointer'
      onClick={onSelect}
    >
      <div className='relative'>
        <div
          className={`absolute -inset-1 rounded-full ${
            isViewed ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
          }`}
        >
          <div className='absolute inset-[3px] bg-white dark:bg-gray-900 rounded-full' />
        </div>

        <Avatar className='h-16 w-16 relative'>
          <AvatarImage src={user.avatar} alt={user.username} className='object-cover' />
          <AvatarFallback className='bg-gradient-to-br from-indigo-400 to-purple-500 text-white'>
            {user.username[0]?.toUpperCase()}
          </AvatarFallback>

          {previewImage && (
            <div className='absolute inset-0 rounded-full overflow-hidden opacity-0 hover:opacity-100 transition-opacity'>
              <div className='absolute inset-0 bg-black/40 z-10' />
              <img src={previewImage} alt='Preview' className='w-full h-full object-cover' />
            </div>
          )}
        </Avatar>

        {!isViewed && (
          <span className='absolute bottom-0 right-0 h-4 w-4 bg-indigo-500 border-2 border-white dark:border-gray-900 rounded-full' />
        )}
      </div>

      <p className='text-xs text-center font-medium truncate max-w-[72px]'>{shortName}</p>
    </motion.div>
  )
}

export default StoryGroup
