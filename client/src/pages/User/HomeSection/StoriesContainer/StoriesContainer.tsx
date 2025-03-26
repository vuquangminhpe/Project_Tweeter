/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useContext, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AppContext } from '@/Contexts/app.context'
import useStories from '@/hooks/useStories'
import StoryGroup from '../StoryGroup/StoryGroup'
import StoryViewer from '../StoryViewer'
import { NewsFeedStory } from '@/apis/stories.api'
import StoryCreator from '../StoryCreator/StoryCreator'

const StoriesContainer = () => {
  const { profile } = useContext(AppContext)
  const [showCreator, setShowCreator] = useState(false)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)

  const { stories, isLoading, refetch, isStoryViewed, openViewer, closeViewer, activeStoryIndex, markStoryAsViewed } =
    useStories({
      limit: 10,
      autoRefresh: true,
      refreshInterval: 30000
    })

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef) return
    const scrollAmount = direction === 'left' ? -200 : 200
    containerRef.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  const handleCloseCreator = () => {
    setShowCreator(false)
    refetch()
  }

  useEffect(() => {
    if (activeStoryIndex !== null && stories && (stories as any)[activeStoryIndex]) {
      const currentStory = (stories as any)[activeStoryIndex]
      if (currentStory._id && !isStoryViewed(currentStory)) {
        markStoryAsViewed(currentStory._id)
      }
    }
  }, [activeStoryIndex, stories, markStoryAsViewed, isStoryViewed])

  const userStories = React.useMemo(() => {
    if (!stories || Number((stories as any)?.length) === 0) return []

    const storyGroups = new Map()
    ;(stories as any)?.forEach((story: any) => {
      if (!story || !story.user || !story.user._id) return

      const userId = story.user._id
      if (!storyGroups.has(userId)) {
        storyGroups.set(userId, {
          user: story.user,
          stories: []
        })
      }

      storyGroups.get(userId).stories.push(story)
    })

    return Array.from(storyGroups.values())
  }, [stories])

  return (
    <div className='w-full mb-6 relative z-[9999999999]'>
      <div className='relative'>
        <button
          onClick={() => scroll('left')}
          className='absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors'
        >
          <ChevronLeft className='h-5 w-5 text-gray-700 dark:text-gray-300' />
        </button>

        <div
          ref={setContainerRef}
          className='flex overflow-x-auto scrollbar-hide py-4 px-2 space-x-4'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className='flex-shrink-0'>
            <div
              onClick={() => setShowCreator(true)}
              className='w-32 h-48 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden relative group'
            >
              <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
              <div className='bg-white dark:bg-gray-900 rounded-full p-1.5 mb-2 z-10'>
                <PlusCircle className='w-8 h-8 text-indigo-600 dark:text-indigo-400' />
              </div>

              <div className='absolute bottom-0 left-0 right-0 p-3'>
                <Avatar className='w-10 h-10 mb-2 mx-auto border-2 border-white dark:border-gray-800'>
                  <AvatarImage src={profile?.avatar} alt={profile?.username || 'User'} />
                  <AvatarFallback className='bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'>
                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <p className='text-xs text-center font-medium text-black dark:text-white'>Create Story</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className='w-20 flex-shrink-0'>
                  <div className='w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 mx-auto mb-2 animate-pulse'></div>
                  <div className='h-2 w-12 mx-auto bg-gray-200 dark:bg-gray-800 rounded animate-pulse'></div>
                </div>
              ))
          ) : userStories && userStories.length > 0 ? (
            userStories.map((group: any) => {
              if (!group || !group.user) return null

              const startIndex = (stories as any)?.findIndex((s: any) => s.user._id === group.user._id) || 0
              const isUserStoriesViewed = group.stories.every((story: any) => isStoryViewed(story))

              return (
                <div key={group.user._id} className='flex-shrink-0 mx-2'>
                  <StoryGroup
                    user={group.user}
                    stories={group.stories}
                    isViewed={isUserStoriesViewed}
                    onSelect={() => openViewer(startIndex)}
                  />
                </div>
              )
            })
          ) : (
            <div className='flex items-center justify-center w-full py-4'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>No stories yet</p>
            </div>
          )}
        </div>

        <button
          onClick={() => scroll('right')}
          className='absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors'
        >
          <ChevronRight className='h-5 w-5 text-gray-700 dark:text-gray-300' />
        </button>
      </div>

      <AnimatePresence>
        {activeStoryIndex !== null && stories && (stories as any)?.result?.length > 0 && (
          <StoryViewer
            stories={stories as NewsFeedStory[]}
            initialIndex={activeStoryIndex}
            onClose={closeViewer}
            currentUserId={profile?._id || ''}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{showCreator && <StoryCreator onClose={handleCloseCreator} />}</AnimatePresence>
    </div>
  )
}

export default StoriesContainer
