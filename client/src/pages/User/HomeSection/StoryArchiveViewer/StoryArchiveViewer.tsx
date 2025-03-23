/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { X, Calendar, Clock, MoreHorizontal, Trash2, Download, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import VideoHLSPlayer from '@/components/Customs/VideoHLSPlayer'
import storiesApi from '@/apis/stories.api'
import { NewsFeedStory } from '@/apis/stories.api'
import { MediaType } from '@/constants/enum'
import { Button } from '@/Components/ui/button'

interface StoryArchiveViewerProps {
  userId: string
  onClose: () => void
}

const StoryArchiveViewer = ({ userId, onClose }: StoryArchiveViewerProps) => {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const {
    data: archiveData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['archive-stories', userId],
    queryFn: () => storiesApi.getArchiveStories(100, 1),
    enabled: !!userId
  })

  const archivedStories = archiveData?.data?.result?.result || []
  const selectedStory = (archivedStories as NewsFeedStory[])[selectedIndex]

  const deleteStoryMutation = useMutation({
    mutationFn: (storyId: string) => storiesApi.deleteStory(storyId),
    onSuccess: () => {
      toast.success('Story deleted from archive')
      refetch()
      if (selectedIndex >= Number(archivedStories?.length) - 1) {
        setSelectedIndex(Math.max(0, Number(archivedStories?.length) - 2))
      }
    },
    onError: () => {
      toast.error('Failed to delete story')
    }
  })

  const formatStoryDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDeleteStory = () => {
    if (selectedStory) {
      deleteStoryMutation.mutate(selectedStory._id as string)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.6 }}
      className='fixed inset-0 z-[99999999999999999] bg-black/80 flex items-center justify-center p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0.5 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className='bg-white dark:bg-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between'>
          <div className='flex items-center'>
            <h2 className='text-xl font-bold'>Story Archive</h2>
            <span className='ml-2 text-sm text-gray-500'>
              ({archivedStories?.length} {archivedStories?.length === 1 ? 'story' : 'stories'})
            </span>
          </div>

          <Button variant='ghost' size='icon' onClick={onClose}>
            <X className='h-5 w-5' />
          </Button>
        </div>

        <div className='flex-1 flex overflow-hidden'>
          <div className='w-72 border-r border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col'>
            <Tabs defaultValue='all' onValueChange={setActiveTab} className='p-3'>
              <TabsList className='w-full'>
                <TabsTrigger value='all' className='flex-1'>
                  All
                </TabsTrigger>
                <TabsTrigger value='media' className='flex-1'>
                  Media
                </TabsTrigger>
                <TabsTrigger value='text' className='flex-1'>
                  Text
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className='flex-1 overflow-y-auto'>
              {isLoading ? (
                <div className='flex flex-col space-y-4 p-4'>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className='flex items-center space-x-3 animate-pulse'>
                      <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
                      <div className='flex-1'>
                        <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2'></div>
                        <div className='h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : archivedStories?.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-full p-4 text-center'>
                  <Calendar className='h-12 w-12 text-gray-400 mb-3' />
                  <p className='text-gray-500'>No archived stories found</p>
                  <p className='text-xs text-gray-400 mt-1'>
                    Stories you share will be automatically archived after 24 hours
                  </p>
                </div>
              ) : (
                <div className='space-y-2 p-2'>
                  {archivedStories
                    ?.filter((story) => {
                      if (activeTab === 'media') return !!story.media_url
                      if (activeTab === 'text') return !story.media_url
                      return true
                    })
                    .map((story, index) => (
                      <div
                        key={story._id}
                        className={`flex items-center p-2 rounded-lg cursor-pointer ${
                          selectedIndex === index
                            ? 'bg-indigo-100 dark:bg-indigo-900/40'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <div className='w-14 h-14 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 mr-3 flex-shrink-0'>
                          {story.media_url ? (
                            <img src={story.media_url} alt='Story thumbnail' className='w-full h-full object-cover' />
                          ) : (
                            <div className='w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center p-1'>
                              <p className='text-white text-xs text-center truncate'>
                                {story.content.substring(0, 20)}
                                {story.content.length > 20 ? '...' : ''}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium line-clamp-1'>
                            {story.content.substring(0, 30)}
                            {story.content.length > 30 ? '...' : ''}
                          </p>
                          <div className='flex items-center text-xs text-gray-500'>
                            <Clock className='h-3 w-3 mr-1' />
                            <span>{formatStoryDate(story.created_at as unknown as Date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className='flex-1 flex flex-col'>
            {Number(archivedStories?.length) === 0 ? (
              <div className='flex-1 flex items-center justify-center'>
                <p className='text-gray-500'>No archived stories to display</p>
              </div>
            ) : (
              <>
                <div className='p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center'>
                  <div className='flex items-center'>
                    <Avatar className='h-8 w-8 mr-2'>
                      <AvatarImage src={selectedStory?.user?.avatar} alt={selectedStory?.user?.username || 'User'} />
                      <AvatarFallback className='bg-indigo-100 text-indigo-800'>
                        {selectedStory?.user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-medium'>{selectedStory?.user?.username}</p>
                      <p className='text-xs text-gray-500'>
                        {selectedStory?.created_at && formatStoryDate(selectedStory.created_at as unknown as Date)}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreHorizontal className='h-5 w-5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem className='flex items-center' onClick={handleDeleteStory}>
                        <Trash2 className='h-4 w-4 mr-2' />
                        <span>Delete</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='flex items-center'>
                        <Download className='h-4 w-4 mr-2' />
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='flex items-center'>
                        <Share2 className='h-4 w-4 mr-2' />
                        <span>Share</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className='flex-1 bg-gray-100 dark:bg-gray-800 z-[99999] flex items-center justify-center p-4 overflow-auto'>
                  <div className='max-w-full max-h-full rounded-lg overflow-hidden shadow-lg'>
                    {selectedStory?.media_url ? (
                      selectedStory.media_type?.includes(MediaType.Video as any) ||
                      selectedStory.media_url.endsWith('master.m3u8') ? (
                        <div className='w-full max-h-[60vh]'>
                          <VideoHLSPlayer src={selectedStory.media_url} classNames='w-full h-full' />
                        </div>
                      ) : (
                        <img
                          src={selectedStory.media_url}
                          alt='Story'
                          className='max-w-full max-h-[70vh] object-contain'
                        />
                      )
                    ) : (
                      <div className='w-96 h-96 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-6 rounded-lg'>
                        <p className='text-white text-xl text-center'>{selectedStory?.content}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedStory?.caption && (
                  <div className='p-4 border-t border-gray-200 dark:border-gray-800'>
                    <p className='text-sm'>{selectedStory.caption}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default StoryArchiveViewer
