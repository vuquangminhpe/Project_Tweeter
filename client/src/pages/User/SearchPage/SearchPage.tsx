import { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppContext } from '@/Contexts/app.context'
import TwitterCard from '../HomeSection/TwitterCard/TwitterCard'
import searchApis from '@/apis/search.api'
import { SearchRequest } from '@/types/Search.type'
import { MediaType } from '@/constants/enum'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageIcon, VideoIcon, Loader2, Users, SearchIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/Components/ui/button'
import { cn } from '@/lib/utils'
import Navigation from '../../../components/Navigation/Navigation'
import RightPart from '@/components/RightPart'
import { SuccessResponse } from '@/types/Utils.type'
import { Tweets } from '@/types/Tweet.type'

interface User {
  _id: string
  name: string
  username: string
  avatar: string
  created_at: string
  bio: string
  location: string
  website: string
  is_followed: boolean
}

interface TweetSearchResponse {
  tweets: Tweets[]
  total_pages: number
  total_tweets: number
  limit: number
  page: number
  execution_time_ms: number
}

interface UserSearchResponse {
  users: User[]
  total_pages: number
  total_users: number
  limit: number
  page: number
  execution_time_ms: number
}

const SearchPage = () => {
  const { profile } = useContext(AppContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchInputValue, setSearchInputValue] = useState<string>('')
  const [searchSubmitted, setSearchSubmitted] = useState(false)

  // Parse search params from URL
  const queryParams = new URLSearchParams(location.search)
  const initialSearchQuery = queryParams.get('q') || ''
  const mediaTypeParam = queryParams.get('media_type')
  const searchUsersParam = queryParams.get('search_users') === 'true'

  // Initialize search input with URL query
  useEffect(() => {
    setSearchInputValue(decodeURIComponent(initialSearchQuery))
  }, [initialSearchQuery])

  // Set up search parameters for tweets
  const [tweetSearchParams, setTweetSearchParams] = useState<SearchRequest>({
    content: initialSearchQuery,
    limit: 10,
    page: 1,
    media_type: mediaTypeParam === 'image'
      ? MediaType.Image
      : mediaTypeParam === 'video'
        ? MediaType.Video
        : undefined
  })

  // Set up search parameters for users
  const [userSearchParams, setUserSearchParams] = useState<SearchRequest>({
    content: initialSearchQuery,
    limit: 5,
    page: 1,
    search_users: true
  })

  // Update state when URL params change
  useEffect(() => {
    setSearchQuery(initialSearchQuery)
    setTweetSearchParams(prev => ({
      ...prev,
      content: initialSearchQuery,
      media_type: mediaTypeParam === 'image'
        ? MediaType.Image
        : mediaTypeParam === 'video'
          ? MediaType.Video
          : undefined,
      page: 1
    }))
    setUserSearchParams(prev => ({
      ...prev,
      content: initialSearchQuery,
      page: 1
    }))
  }, [initialSearchQuery, mediaTypeParam])

  // Set active tab based on URL params
  useEffect(() => {
    if (searchUsersParam) {
      setActiveTab('users')
    } else if (mediaTypeParam === 'image') {
      setActiveTab('images')
    } else if (mediaTypeParam === 'video') {
      setActiveTab('videos')
    } else {
      setActiveTab('all')
    }
  }, [mediaTypeParam, searchUsersParam])

  // Fetch tweet search results
  const {
    data: tweetSearchData,
    isLoading: isTweetLoading,
    isError: isTweetError,
    error: tweetError,
    refetch: refetchTweets
  } = useQuery<SuccessResponse<TweetSearchResponse>>({
    queryKey: ['searchTweets', tweetSearchParams],
    queryFn: () => searchApis.searchTweets(tweetSearchParams),
    enabled: !!tweetSearchParams.content && activeTab !== 'users',
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  // Fetch user search results
  const {
    data: userSearchData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    refetch: refetchUsers
  } = useQuery<SuccessResponse<UserSearchResponse>>({
    queryKey: ['searchUsers', userSearchParams],
    queryFn: () => searchApis.searchUsers(userSearchParams),
    enabled: !!userSearchParams.content && (activeTab === 'users' || activeTab === 'all'),
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    const params = new URLSearchParams()
    params.set('q', searchQuery)

    if (value === 'users') {
      params.set('search_users', 'true')
      params.delete('media_type')
    } else if (value === 'images') {
      params.set('media_type', 'image')
      params.delete('search_users')
    } else if (value === 'videos') {
      params.set('media_type', 'video')
      params.delete('search_users')
    } else {
      params.delete('media_type')
      params.delete('search_users')
    }

    navigate(`/user/search?${params.toString()}`)
  }

  // Handle search input submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!searchInputValue.trim()) return
    
    setSearchQuery(searchInputValue.trim())
    
    const params = new URLSearchParams()
    params.set('q', searchInputValue.trim())
    
    // Preserve current filters
    if (activeTab === 'users') {
      params.set('search_users', 'true')
    } else if (activeTab === 'images') {
      params.set('media_type', 'image')
    } else if (activeTab === 'videos') {
      params.set('media_type', 'video')
    }
    
    navigate(`/user/search?${params.toString()}`)
    
    // Visual feedback for search
    setSearchSubmitted(true)
    setTimeout(() => setSearchSubmitted(false), 300)
  }

  // Handle pagination for tweets
  const handleTweetPageChange = (newPage: number) => {
    if (tweetSearchData?.data.result && (newPage < 1 || newPage > tweetSearchData.data.result.total_pages)) {
      return
    }

    setTweetSearchParams(prev => ({
      ...prev,
      page: newPage
    }))

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle pagination for users
  const handleUserPageChange = (newPage: number) => {
    if (userSearchData?.data.result && (newPage < 1 || newPage > userSearchData.data.result.total_pages)) {
      return
    }

    setUserSearchParams(prev => ({
      ...prev,
      page: newPage
    }))

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Render user list
  const renderUserList = (users: User[]) => (
    <div className="divide-y">
      {users.map((user) => (
        <div key={user._id} className="p-4 flex items-center space-x-4">
          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
          <div>
            <div className="font-bold">{user.name}</div>
            <div className="text-gray-500">@{user.username}</div>
            <div className="text-sm">{user.bio}</div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className='bg-black flex min-h-screen max-w-[1500px] mx-auto'>
      <Navigation />
      
      <main className='text-white flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px]'>
        <div className='text-[#d9d9d9] flex items-center sm:justify-between py-2 px-3 sticky top-0 z-50 
            bg-black border-b border-gray-700'>
          <h2 className='text-lg sm:text-xl font-bold'>Search</h2>
        </div>
        
        <div className="px-4 py-2">
          {/* Improved search input - smaller and centered */}
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className={cn(
              "relative flex items-center rounded-full border border-gray-700 bg-black focus-within:border-blue-500 transition-all",
              "max-w-md mx-auto", 
              searchSubmitted && "scale-95"
            )}>
              <input
                type="search"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                placeholder="Search Twitter"
                className="w-full bg-transparent py-2 pl-10 pr-4 text-white focus:outline-none rounded-full"
              />
              <SearchIcon 
                className="absolute left-3 size-5 text-gray-500" 
              />
              <button 
                type="submit" 
                className="absolute right-2 p-1 text-blue-500 hover:bg-blue-900/20 rounded-full"
                aria-label="Search"
              >
                <SearchIcon size={18} />
              </button>
            </div>
          </form>
          
          {/* Fixed tabs with even sizing and proper centering */}
          <div className='flex items-center justify-center sticky top-0 z-50 bg-black border-b border-gray-700'>
            <div
              className={`relative flex-1 text-center py-3 cursor-pointer transition duration-300 ${
                activeTab === 'all' ? 'text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => handleTabChange('all')}
            >
              All
              {activeTab === 'all' && (
                <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80px] border-b-4 border-[#1D9BF0]'></div>
              )}
            </div>
            <div
              className={`relative flex-1 text-center py-3 cursor-pointer transition duration-300 ${
                activeTab === 'images' ? 'text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => handleTabChange('images')}
            >
              <div className='flex items-center justify-center gap-1'>
                <ImageIcon size={16} /> Images
              </div>
              {activeTab === 'images' && (
                <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80px] border-b-4 border-[#1D9BF0]'></div>
              )}
            </div>
            <div
              className={`relative flex-1 text-center py-3 cursor-pointer transition duration-300 ${
                activeTab === 'users' ? 'text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => handleTabChange('users')}
            >
              <div className='flex items-center justify-center gap-1'>
                <Users size={16} /> People
              </div>
              {activeTab === 'users' && (
                <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80px] border-b-4 border-[#1D9BF0]'></div>
              )}
            </div>
          </div>
          
          {/* Rest of search results content */}
          <div className='pb-72'>
            {/* Search metadata */}
            {searchQuery && !isTweetLoading && !isUserLoading && !isTweetError && !isUserError && (
              <div className="py-2 text-sm text-gray-500">
                {activeTab === 'users' 
                  ? `${userSearchData?.data.result?.total_users || 0} people` 
                  : `${tweetSearchData?.data.result?.total_tweets || 0} results`}
                <span className="ml-1">
                  for "{searchQuery}"
                </span>
              </div>
            )}
            
            {!searchQuery && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <SearchIcon size={48} strokeWidth={1.5} className="mb-4 text-gray-700" />
                <p className="text-xl font-medium mb-2">Search for content</p>
                <p className="text-sm">Try searching for people, topics, or keywords</p>
              </div>
            )}
            
            {/* Loading state */}
            {(isTweetLoading || isUserLoading) && (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
              </div>
            )}

            {/* Error state */}
            {(isTweetError || isUserError) && (
              <div className="text-center py-10">
                <div className="text-red-500 mb-2">Error loading search results</div>
                <div className="text-gray-500 text-sm">{(tweetError || userError)?.message}</div>
                <Button
                  variant="outline"
                  className="mt-4 border-gray-800 text-blue-500 hover:bg-gray-900"
                  onClick={() => {
                    if (isTweetError) refetchTweets()
                    if (isUserError) refetchUsers()
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* No results */}
            {searchQuery && !isTweetLoading && !isUserLoading && !isTweetError && !isUserError && (
              (activeTab === 'users' && userSearchData?.data.result?.users.length === 0) ||
              (activeTab !== 'users' && tweetSearchData?.data.result?.tweets.length === 0)
            ) && (
              <div className="text-center py-16">
                <p className="text-xl font-medium text-gray-300 mb-2">No matching {activeTab === 'users' ? 'users' : 'tweets'} found</p>
                <p className="text-gray-500 mb-4">Try using different keywords or removing filters</p>
              </div>
            )}

            {/* Results display */}
            {activeTab === 'all' && searchQuery && (
              <div>
                {/* Display users */}
                {userSearchData?.data.result?.users && userSearchData.data.result.users.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-bold">People</h2>
                      <Button
                        variant="ghost"
                        className="text-blue-500 hover:bg-gray-900"
                        onClick={() => handleTabChange('users')}
                      >
                        Show more
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {userSearchData.data.result.users.slice(0, 3).map((user) => (
                        <UserResultCard key={user._id} user={user} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Display tweets */}
                {tweetSearchData?.data.result?.tweets && tweetSearchData.data.result.tweets.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {tweetSearchData.data.result.tweets.map((tweet) => (
                      <TwitterCard
                        key={tweet._id}
                        profile={profile}
                        data={tweet}
                        data_length={tweet.medias?.length || 0}
                        refetchAllDataTweet={refetchTweets}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && userSearchData?.data.result?.users && (
              <div className="space-y-3">
                {userSearchData.data.result.users.map((user) => (
                  <UserResultCard key={user._id} user={user} />
                ))}
              </div>
            )}

            {(activeTab === 'images' || activeTab === 'videos') && tweetSearchData?.data.result?.tweets && (
              <div className="space-y-1">
                {tweetSearchData.data.result.tweets.map((tweet) => (
                  <TwitterCard
                    key={tweet._id}
                    profile={profile}
                    data={tweet}
                    data_length={tweet.medias?.length || 0}
                    refetchAllDataTweet={refetchTweets}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {activeTab !== 'all' && searchQuery && (
              <div className="flex justify-center py-6">
                {activeTab === 'users' && userSearchData?.data.result?.total_pages > 1 && (
                  <PaginationControls 
                    currentPage={userSearchParams.page} 
                    totalPages={userSearchData.data.result.total_pages}
                    onPageChange={handleUserPageChange}
                  />
                )}

                {(activeTab === 'images' || activeTab === 'videos') && tweetSearchData?.data.result?.total_pages > 1 && (
                  <PaginationControls 
                    currentPage={tweetSearchParams.page} 
                    totalPages={tweetSearchData.data.result.total_pages}
                    onPageChange={handleTweetPageChange}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <RightPart />
    </div>
  )
}

// Helper component for pagination
const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number, 
  totalPages: number, 
  onPageChange: (page: number) => void 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        className="border-gray-700 bg-transparent hover:bg-gray-900 text-white"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <div className="text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="border-gray-700 bg-transparent hover:bg-gray-900 text-white"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};

// User result card component
const UserResultCard = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (user.username) {
      navigate(`/${user.username}`);
    }
  };
  
  return (
    <div 
      className="p-3 rounded-lg hover:bg-gray-900/40 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="font-bold hover:underline">{user.name}</div>
          <div className="text-gray-500">@{user.username}</div>
          {user.bio && (
            <div className="text-sm text-gray-300 mt-1 line-clamp-2">{user.bio}</div>
          )}
        </div>
        {user.is_followed !== undefined && (
          <Button 
            variant={user.is_followed ? "outline" : "default"}
            size="sm"
            className={user.is_followed 
              ? "rounded-full border-gray-600 bg-transparent hover:bg-gray-900 text-white"
              : "rounded-full bg-white text-black hover:bg-gray-200"
            }
            onClick={(e) => e.stopPropagation()} // Prevent navigation
          >
            {user.is_followed ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchPage