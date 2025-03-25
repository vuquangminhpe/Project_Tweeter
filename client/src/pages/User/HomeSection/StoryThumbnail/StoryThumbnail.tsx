/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MediaType } from '@/constants/enum'
import { NewsFeedStory } from '@/apis/stories.api'
import { Play } from 'lucide-react'

interface StoryThumbnailProps {
  story: NewsFeedStory
  isViewed: boolean
  onClick: () => void
}

const StoryThumbnail = ({ story, isViewed, onClick }: StoryThumbnailProps) => {
  const formatTimeAgo = (dateString: string | Date) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()

    const seconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h`
    } else if (minutes > 0) {
      return `${minutes}m`
    } else {
      return 'now'
    }
  }

  return (
    <div className='w-28 z-[99999] h-44 flex-shrink-0 cursor-pointer relative group' onClick={onClick}>
      <div
        className={`absolute -inset-1 rounded-xl ${
          isViewed
            ? 'bg-gray-300 dark:bg-gray-700'
            : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-pulse-slow'
        }`}
      >
        <div className='absolute inset-[3px] bg-white dark:bg-gray-900 rounded-lg'></div>
      </div>

      <div className='absolute inset-0 overflow-hidden rounded-xl'>
        {story.media_url ? (
          <>
            {story.media_type?.includes(MediaType.Video as any) || story.media_url.endsWith('master.m3u8') ? (
              <div className='w-full h-full bg-gray-800 flex items-center justify-center relative'>
                <div className='absolute inset-0 bg-gradient-to-b from-black/30 to-black/70'></div>
                <Play className='w-8 h-8 text-white opacity-70 z-10' />
              </div>
            ) : (
              <img src={story.media_url} alt={story.user?.username || 'Story'} className='w-full h-full object-cover' />
            )}
          </>
        ) : (
          <div className='w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-3'>
            <p className='text-white text-xs text-center line-clamp-3 overflow-hidden'>{story.content}</p>
          </div>
        )}

        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 opacity-70 group-hover:opacity-50 transition-opacity'></div>
      </div>

      <div className='absolute bottom-2 left-0 right-0 px-2 z-10'>
        <div className='flex flex-col items-center'>
          <Avatar className='w-8 h-8 border-2 border-white dark:border-gray-800 mb-1'>
            <AvatarImage src={story.user?.avatar} alt={story.user?.username || 'User'} />
            <AvatarFallback className='bg-indigo-100 text-indigo-800'>
              {story.user?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <p className='text-xs font-medium text-white truncate max-w-full'>
            {story.user?.name?.split(' ')[0] || story.user?.username?.split(' ')[0]}
          </p>

          {story.created_at && (
            <p className='text-[10px] text-gray-200'>{formatTimeAgo(story.created_at as unknown as Date)}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StoryThumbnail
