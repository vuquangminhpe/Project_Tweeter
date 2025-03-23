import { useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Clock, Settings, Archive } from 'lucide-react'
import { AppContext } from '@/Contexts/app.context'
import storiesApi, { NewsFeedStory } from '@/apis/stories.api'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/Components/ui/button'
import StoriesContainer from '../StoriesContainer'
import StoryViewer from '../StoryViewer'
import StoryArchiveViewer from '../StoryArchiveViewer'

const StoriesPage = () => {
  const { profile } = useContext(AppContext)
  const [activeTab, setActiveTab] = useState('feed')
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
  const [showArchive, setShowArchive] = useState(false)

  const { data: storiesData, isLoading: isLoadingStories } = useQuery({
    queryKey: ['news-feed-stories'],
    queryFn: () => storiesApi.getNewsFeedStories(20, 1),
    enabled: !!profile?._id
  })

  const { data: archivedStoriesData, isLoading: isLoadingArchived } = useQuery({
    queryKey: ['archive-stories'],
    queryFn: () => storiesApi.getArchiveStories(20, 1),
    enabled: !!profile?._id && activeTab === 'archive'
  })

  const stories = storiesData?.data?.result.result
  const archivedStories = archivedStoriesData?.data?.result

  const selectedStoryIndex = stories?.findIndex((story) => story._id === selectedStoryId)

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date)
  }

  return (
    <div className='max-w-6xl mx-auto z-[99999] px-4 py-6'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='icon' onClick={() => window.history.back()} className='rounded-full'>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-2xl font-bold'>Stories</h1>
        </div>

        <div className='flex items-center space-x-2'>
          <Button variant='ghost' size='icon' className='rounded-full' onClick={() => setShowArchive(true)}>
            <Archive className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon' className='rounded-full'>
            <Clock className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon' className='rounded-full'>
            <Settings className='h-5 w-5' />
          </Button>
        </div>
      </div>

      <Tabs defaultValue='feed' onValueChange={setActiveTab} className='mb-6'>
        <TabsList className='w-full'>
          <TabsTrigger value='feed' className='flex-1'>
            Your Feed
          </TabsTrigger>
          <TabsTrigger value='archive' className='flex-1'>
            Archive
          </TabsTrigger>
        </TabsList>

        <TabsContent value='feed'>
          <div className='rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden'>
            <div className='p-4'>
              <h2 className='text-lg font-semibold mb-4'>Recent Stories</h2>
              <StoriesContainer />
            </div>

            <Separator />
            <div className='p-4'>
              <h2 className='text-lg font-semibold mb-4'>All Stories</h2>

              {isLoadingStories ? (
                <div className='flex items-center justify-center h-32'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500'></div>
                </div>
              ) : Number(stories?.length) > 0 ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                  {stories?.map((story) => (
                    <div
                      key={story._id}
                      className='aspect-[3/4] rounded-lg overflow-hidden relative cursor-pointer group'
                      onClick={() => setSelectedStoryId(story._id as string)}
                    >
                      {story.media_url ? (
                        <img
                          src={story.media_url}
                          alt={story.user?.username || 'Story'}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4'>
                          <p className='text-white text-center line-clamp-3 text-sm'>{story.content}</p>
                        </div>
                      )}

                      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 opacity-70 group-hover:opacity-50 transition-opacity'>
                        <div className='absolute bottom-3 left-3 right-3'>
                          <div className='flex items-center'>
                            <img
                              src={story.user?.avatar}
                              alt={story.user?.username || 'User'}
                              className='w-8 h-8 rounded-full border-2 border-white mr-2'
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'
                              }}
                            />
                            <div>
                              <p className='text-white text-sm font-medium truncate'>
                                {story.user?.name || story.user?.username}
                              </p>
                              <p className='text-gray-300 text-xs'>{formatDate(story.created_at as unknown as Date)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <p className='text-gray-500'>No stories to display</p>
                  <Button variant='outline' className='mt-4'>
                    Create a story
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='archive'>
          <div className='rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden p-4'>
            <h2 className='text-lg font-semibold mb-4'>Your Archive</h2>

            {isLoadingArchived ? (
              <div className='flex items-center justify-center h-32'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500'></div>
              </div>
            ) : Number(archivedStories?.result?.length) > 0 ? (
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {archivedStories?.result?.map((story) => (
                  <div
                    key={story._id}
                    className='aspect-[3/4] rounded-lg overflow-hidden relative cursor-pointer group'
                    onClick={() => setSelectedStoryId(story._id as string)}
                  >
                    {story.media_url ? (
                      <img
                        src={story.media_url}
                        alt={story.user?.username || 'Story'}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center p-4'>
                        <p className='text-white text-center line-clamp-3 text-sm'>{story.content}</p>
                      </div>
                    )}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 opacity-70 group-hover:opacity-50 transition-opacity'>
                      <div className='absolute bottom-3 left-3 right-3'>
                        <p className='text-white text-sm font-medium'>Archived story</p>
                        <p className='text-gray-300 text-xs'>{formatDate(story.created_at as unknown as Date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <p className='text-gray-500'>No archived stories</p>
                <p className='text-sm text-gray-400 mt-2'>
                  Stories you've shared will be automatically archived after 24 hours.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedStoryIndex !== -1 && selectedStoryId && (
        <StoryViewer
          stories={stories as NewsFeedStory[]}
          initialIndex={selectedStoryIndex as number}
          onClose={() => setSelectedStoryId(null)}
          currentUserId={profile?._id || ''}
        />
      )}

      {showArchive && profile?._id && <StoryArchiveViewer userId={profile._id} onClose={() => setShowArchive(false)} />}
    </div>
  )
}

export default StoriesPage
