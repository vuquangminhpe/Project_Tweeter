/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, MoreHorizontal, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import VideoHLSPlayer from '@/components/Customs/VideoHLSPlayer'
import storiesApi from '@/apis/stories.api'
import { NewsFeedStory } from '@/apis/stories.api'
import { MediaType } from '@/constants/enum'
import StoryReactions from '../StoryReactions'
import StoryProgressBar from '../StoryProgressBar'
import useStories from '@/hooks/useStories'

interface StoryViewerProps {
  stories: NewsFeedStory[]
  initialIndex: number
  onClose: () => void
  currentUserId: string
}

const StoryViewer = ({ stories, initialIndex, onClose, currentUserId }: StoryViewerProps) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isReacting, setIsReacting] = useState(false)
  const [reactionType, setReactionType] = useState('')
  const [comment, setComment] = useState('')
  const progressIntervalRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const queryClient = useQueryClient()
  const { refetch, viewStoryMutation, reactStoryMutation } = useStories()

  const currentStory = stories[currentStoryIndex]

  const commentStoryMutation = useMutation({
    mutationFn: (data: { story_id: string; content: string }) => storiesApi.addStoryComment(data),
    onSuccess: () => {
      toast.success('Comment sent!')
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['news-feed-stories'] })
      refetch()
    },
    onError: (error) => {
      console.error('Failed to comment on story:', error)
      toast.error('Failed to send comment')
    }
  })

  const navigateStory = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentSegmentIndex > 0) {
        setCurrentSegmentIndex(currentSegmentIndex - 1)
      } else if (currentStoryIndex > 0) {
        setCurrentStoryIndex(currentStoryIndex - 1)
        setCurrentSegmentIndex(0)
      }
    } else {
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1)
        setCurrentSegmentIndex(0)
      } else {
        onClose()
      }
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)

    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  const handleSendReaction = () => {
    if (!reactionType || !currentStory?._id) return

    reactStoryMutation.mutate(
      {
        story_id: currentStory._id as string,
        reaction: reactionType
      },
      {
        onSuccess: () => {
          toast.success('Reaction sent!')
          setIsReacting(false)
          setReactionType('')
          refetch()
        }
      }
    )
  }

  const handleSendComment = () => {
    if (!comment.trim() || !currentStory?._id) return

    commentStoryMutation.mutate({
      story_id: currentStory._id as string,
      content: comment.trim()
    })
  }

  useEffect(() => {
    if (currentStory && currentStory._id) {
      viewStoryMutation.mutate(
        {
          story_id: currentStory._id,
          view_status: 'seen',
          content: ''
        },
        {
          onSuccess: () => {
            refetch()
          }
        }
      )
    }
  }, [currentStoryIndex, currentStory, viewStoryMutation, refetch])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        navigateStory('prev')
      } else if (e.key === 'ArrowRight') {
        navigateStory('next')
      } else if (e.key === ' ') {
        togglePause()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStoryIndex, currentSegmentIndex])

  const formatTimeAgo = (dateString: string | Date) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()

    const seconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return days === 1 ? '1 day ago' : `${days} days ago`
    } else if (hours > 0) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`
    } else if (minutes > 0) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
    } else {
      return seconds <= 10 ? 'just now' : `${seconds} seconds ago`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.6 }}
      className='fixed inset-0 z-[99999] bg-black flex items-center justify-center'
    >
      <button
        onClick={onClose}
        className='absolute top-4 right-4 z-[99999] p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors'
      >
        <X className='w-6 h-6 text-white' />
      </button>

      <div className='relative w-full h-full max-w-3xl max-h-[90vh] mx-auto'>
        <div className='relative w-full h-full flex items-center justify-center'>
          <div className='absolute top-0 left-0 right-0 z-20 p-4'>
            <StoryProgressBar
              count={stories.length}
              activeIndex={currentStoryIndex}
              duration={5000}
              isPaused={isPaused}
              onComplete={() => navigateStory('next')}
            />
          </div>

          <div className='absolute top-8 left-0 right-0 z-20 px-4'>
            <div className='flex items-center'>
              <Avatar className='h-10 w-10 ring-2 ring-white'>
                <AvatarImage src={currentStory?.user?.avatar} alt={currentStory?.user?.username || 'User'} />
                <AvatarFallback className='bg-gradient-to-br from-indigo-500 to-purple-500 text-white'>
                  {currentStory?.user?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className='ml-3 text-white'>
                <p className='font-medium'>{currentStory?.user?.name || currentStory?.user?.username}</p>
                <p className='text-xs opacity-80'>
                  {currentStory?.created_at ? formatTimeAgo(currentStory.created_at as unknown as Date) : 'Recently'}
                </p>
              </div>

              <div className='ml-auto'>
                <button className='p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors'>
                  <MoreHorizontal className='w-5 h-5 text-white' />
                </button>
              </div>
            </div>
          </div>

          {/* Media content */}
          <div className='w-full h-full flex items-center justify-center bg-black'>
            {currentStory?.media_url ? (
              currentStory.media_type?.includes(MediaType.Video as any) ||
              currentStory.media_url.endsWith('master.m3u8') ? (
                <div className='w-full h-full flex items-center justify-center'>
                  <VideoHLSPlayer src={currentStory.media_url} classNames='w-full h-full object-contain' />
                </div>
              ) : (
                <img src={currentStory.media_url} alt='Story' className='max-w-full max-h-full object-contain' />
              )
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-8'>
                <p className='text-white text-center text-xl font-medium'>{currentStory?.content}</p>
              </div>
            )}
          </div>

          {currentStory?.caption && (
            <div className='absolute bottom-24 left-0 right-0 px-4 py-2 z-20'>
              <div className='bg-black/50 backdrop-blur-sm rounded-lg p-3'>
                <p className='text-white'>{currentStory.caption}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => navigateStory('prev')}
            className='absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors'
            disabled={currentStoryIndex === 0 && currentSegmentIndex === 0}
          >
            <ChevronLeft className='w-6 h-6 text-white' />
          </button>

          <button
            onClick={() => navigateStory('next')}
            className='absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors'
          >
            <ChevronRight className='w-6 h-6 text-white' />
          </button>

          <button
            onClick={togglePause}
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/30 hover:bg-black/50 transition-colors'
          >
            {isPaused ? (
              <Play className='w-8 h-8 text-white' />
            ) : (
              <Pause className='w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity' />
            )}
          </button>

          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-20'>
            <StoryReactions
              onReaction={(reaction: any) => {
                setReactionType(reaction)
                handleSendReaction()
              }}
              onComment={(text: any) => {
                setComment(text)
                handleSendComment()
              }}
              disabled={commentStoryMutation.isPending || reactStoryMutation.isPending}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StoryViewer
