import React, { useState, useRef, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import storiesApi, { NewsFeedStory } from '@/apis/stories.api'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StoryDetail from '../StoryDetail/StoryDetail'

interface StoryCardProps {
  item: NewsFeedStory;
  onClick: () => void;
  isActive: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({ item, onClick, isActive }) => {
  const avatarBorderColor = item.user.is_online ? 'border-blue-600' : 'border-gray-800'
  return (
    <div 
      className={`w-36 h-52 rounded-xl overflow-hidden flex flex-col relative group cursor-pointer ${isActive ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onClick}
    >
      <img
        className='w-full h-full object-cover transition duration-300 ease-in-out transform group-hover:scale-105'
        src={item.media_url}
        alt={item.content}
      />
      {item.user?.avatar && (
       <div>
          <Avatar className={`absolute top-2 left-2 ${avatarBorderColor}`}>
            <AvatarImage src={item.user.avatar} alt={item.user.username} />
            <AvatarFallback className='bg-gray-800 text-gray-400'>
              {(item.user.name || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
       </div>
      )}
      <div className='absolute inset-x-3 bottom-1'>
        <p className='text-white font-semibold'>{item.content}</p>
      </div>
      <div className='absolute inset-0 bg-black opacity-0 transition duration-300 ease-in-out group-hover:opacity-20'></div>
    </div>
  )
}

const Story: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0)
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
  const [showStoryDetail, setShowStoryDetail] = useState(false)
  const storiesPerPage = 5
  const shouldFetchMoreRef = useRef(false)

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['stories'],
    queryFn: async ({ pageParam = 1 }) => {
      console.log('Fetching page:', pageParam)
      const response = await storiesApi.getNewsFeedStories(storiesPerPage, pageParam)
      console.log(response)
      if (!Array.isArray(response.data.result)) {
        throw new Error('Invalid API response format')
      }
      return response.data.result
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === storiesPerPage ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  })

  // Gom tất cả các trang thành 1 mảng duy nhất
  const stories = data?.pages.flat() || []

  // Handle story selection
  const handleStoryClick = (storyId: string) => {
    setSelectedStoryId(storyId)
    setShowStoryDetail(true)
  }

  // Close story detail view
  const handleCloseStoryDetail = () => {
    setShowStoryDetail(false)
  }

  // Effect để xử lý việc fetch data khi cần thiết
  useEffect(() => {
    const handleFetchIfNeeded = async () => {
      if (shouldFetchMoreRef.current && hasNextPage && !isFetchingNextPage) {
        await fetchNextPage()
        shouldFetchMoreRef.current = false
      }
    }

    handleFetchIfNeeded()
  }, [startIndex, hasNextPage, isFetchingNextPage, fetchNextPage])

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0))
  }

  const handleNext = () => {
    // Kiểm tra xem có cần fetch thêm data không
    if (startIndex + storiesPerPage >= stories.length - 1 && hasNextPage) {
      shouldFetchMoreRef.current = true
    }
    
    setStartIndex((prev) => prev + 1)
  }

  if (isLoading) {
    return <div className='min-h-screen bg-gray-900 p-6 text-white'>Loading stories...</div>
  }

  if (error) {
    return <div className='min-h-screen bg-gray-900 p-6 text-white'>Error loading stories</div>
  }

  const visibleStories = stories.slice(startIndex, startIndex + storiesPerPage)
  const hasMoreStories = startIndex < stories.length - storiesPerPage || hasNextPage

  // Show story detail if a story is selected
  if (showStoryDetail && selectedStoryId) {
    const initialStoryIndex = stories.findIndex(story => story._id === selectedStoryId)
    return (
      <StoryDetail 
        stories={stories}
        initialStoryIndex={initialStoryIndex >= 0 ? initialStoryIndex : 0}
        onClose={handleCloseStoryDetail}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />
    )
  }

  console.log('Debug info:', {
    totalStories: stories.length,
    startIndex,
    hasNextPage,
    hasMoreStories,
    visibleStoriesCount: visibleStories.length
  })

  return (
    <div className='min-h-screen bg-gray-900 p-6'>
      <div className='max-w-4xl mx-auto relative'>
        <div className='px-12'>
          <div className='flex space-x-2 justify-center'>
            {visibleStories.map((item) => (
              <StoryCard 
                key={item._id} 
                item={item} 
                onClick={() => handleStoryClick(item._id)}
                isActive={item._id === selectedStoryId}
              />
            ))}
          </div>
        </div>

        {startIndex > 0 && (
          <button
            onClick={handlePrev}
            className='absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 p-2 rounded-full cursor-pointer z-10'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-200'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
          </button>
        )}

        {hasMoreStories && (
          <button
            onClick={handleNext}
            className='absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 p-2 rounded-full cursor-pointer z-10'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-200'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        )}

        {isFetchingNextPage && (
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white'>
            Loading more stories...
          </div>
        )}
      </div>
    </div>
  )
}

export default Story