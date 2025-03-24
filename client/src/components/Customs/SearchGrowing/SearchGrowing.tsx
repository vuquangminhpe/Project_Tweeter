'use client'
import searchApi from '@/apis/search.api'
import { cn } from '@/lib/utils'
import { MediaType } from '@/constants/enum'
import { SearchRequest } from '@/types/Search.type'
import { Tweets } from '@/types/Tweet.type'
import { useQuery } from '@tanstack/react-query'
import { SearchIcon, ImageIcon, VideoIcon, Loader2, UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from 'react-router-dom'


type User = {
  _id?: string
  name?: string
  username?: string
  avatar?: string
  bio?: string
  is_followed?: boolean
}
type TweetWithUser = Tweets & {
  user?: User
}

// Simple debounce function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default function GrowingSearchVariant1() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // Check authentication on component mount (client-side only)
  useEffect(() => {
    const access_token = localStorage.getItem("access_token")
    setIsLoggedIn(!!access_token)
  }, [])
  
  return (
    <div className='flex flex-col items-center w-full'>
      <p className='mb-8 text-neutral-500/70 tracking-tighter translate-y-8'>Enter the Search all tweet,...</p>
      <SearchBarWithResults isLoggedIn={isLoggedIn} />
    </div>
  )
}

export const SearchBarWithResults = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const navigate = useNavigate()
  const [searchSubmittedOutline, setSearchSubmittedOutline] = useState(false)
  const [searchSubmittedShadow, setSearchSubmittedShadow] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchParams, setSearchParams] = useState<SearchRequest>({
    content: '',
    limit: 10,
    page: 1,
    media_type: undefined,
    search_users: false
  })

  // Apply debounce to search input with 500ms delay
  const debouncedSearchValue = useDebounce(searchValue, 500)

  // Auto-search effect that runs when debounced search value changes
  useEffect(() => {
    if (debouncedSearchValue.trim()) {
      if (!isLoggedIn) {
        toast.error("Please log in to search")
        return
      }
      
      setSearchParams(prev => ({
        ...prev,
        content: debouncedSearchValue,
        page: 1,
        limit: 5 // Limit to 5 results for auto-search
      }))
    } else {
      // Clear search content when input is empty
      setSearchParams(prev => ({
        ...prev,
        content: '',
        page: 1
      }))
    }
  }, [debouncedSearchValue, isLoggedIn])

  const {
    data: tweetSearchData,
    isLoading: isTweetsLoading,
    isError: isTweetsError,
    error: tweetsError,
  } = useQuery({
    queryKey: ['search', 'tweets', searchParams],
    queryFn: () => searchApi.searchTweets({
      content: searchParams.content,
      limit: searchParams.limit,
      page: searchParams.page,
      media_type: searchParams.media_type
    }),
    enabled: !!searchParams.content && isLoggedIn && !searchParams.search_users,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  const {
    data: userSearchData,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
  } = useQuery({
    queryKey: ['search', 'users', searchParams],
    queryFn: () => searchApi.searchUsers({
      content: searchParams.content,
      limit: searchParams.limit,
      page: searchParams.page,
      search_users: true
    }),
    enabled: !!searchParams.content && isLoggedIn && searchParams.search_users,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  // Derived loading, error states
  const isLoading = isTweetsLoading || isUsersLoading;
  const isError = isTweetsError || isUsersError;
  const error = tweetsError || usersError;

  // Updated handleSearch function with navigation
  function handleSearch() {
    setSearchSubmittedOutline(true)
    setSearchSubmittedShadow(true)
    
    if (!searchValue.trim()) {
      toast.warning('Please enter a search term')
      return
    }
    
    if (!isLoggedIn) {
      toast.error("Please log in to search")
      return
    }
    
    // Tạo query parameters
    const params = new URLSearchParams({
      q: encodeURIComponent(searchValue.trim())
    })
    
    if (searchParams.media_type !== undefined) {
      params.append('media_type', searchParams.media_type === MediaType.Image ? 'image' : 'video')
    }
    
    if (searchParams.search_users) {
      params.append('search_users', 'true')
    }
    
    // Navigate sang trang /user/search với các tham số
    navigate(`/user/search?${params.toString()}`)
  }

  // Updated filter toggle functions to ensure mutual exclusivity
  function toggleImageFilter() {
    if (!isLoggedIn) {
      toast.error("Please log in to use search filters")
      return
    }
    
    setSearchParams(prev => ({
      ...prev,
      media_type: prev.media_type === MediaType.Image ? undefined : MediaType.Image,
      search_users: false, // Turn off user search when selecting images
      page: 1 // Reset to first page on filter change
    }))
  }
  
  function toggleVideoFilter() {
    if (!isLoggedIn) {
      toast.error("Please log in to use search filters")
      return
    }
    
    setSearchParams(prev => ({
      ...prev,
      media_type: prev.media_type === MediaType.Video ? undefined : MediaType.Video,
      search_users: false, // Turn off user search when selecting videos
      page: 1 // Reset to first page on filter change
    }))
  }

  function toggleUserFilter() {
    if (!isLoggedIn) {
      toast.error("Please log in to use search filters")
      return
    }
    
    setSearchParams(prev => ({
      ...prev,
      search_users: !prev.search_users,
      media_type: undefined, // Turn off media filters when selecting users
      page: 1 // Reset to first page on filter change
    }))
  }

  function handlePageChange(newPage: number) {
    if (!isLoggedIn) {
      toast.error("Please log in to browse more results")
      return
    }
    
    const totalPages = searchParams.search_users
      ? userSearchData?.data.result.total_pages
      : tweetSearchData?.data.result.total_pages;
    
    if (newPage < 1 || (totalPages && newPage > totalPages)) {
      return
    }
    
    setSearchParams(prev => ({
      ...prev,
      page: newPage
    }))
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (searchSubmittedOutline) {
      setTimeout(() => {
        setSearchSubmittedOutline(false)
      }, 150)
    }
  }, [searchSubmittedOutline])

  useEffect(() => {
    if (searchSubmittedShadow) {
      setTimeout(() => {
        setSearchSubmittedShadow(false)
      }, 1000)
    }
  }, [searchSubmittedShadow])

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <label
        className={cn(
          'relative inline-flex origin-center rounded-full',
          'group transform-gpu transition-all ease-in-out',
          'relative border border-gray-700 focus-within:border-blue-500',
          "before:absolute before:top-0 before:left-0 before:h-full before:w-full before:transform-gpu before:rounded-full before:transition-all before:duration-700 before:ease-in-out before:content-['']",
          searchSubmittedShadow
            ? 'before:shadow-[0px_0px_0px_5px_rgba(29,155,240,0.3)] before:blur-md'
            : 'before:shadow-[0px_0px_1px_0px_#FFFFFF00] before:blur-0',
          searchSubmittedOutline ? 'scale-90 duration-75' : 'duration-300 hover:scale-[1.02]',
          'bg-black text-gray-200'
        )}
        htmlFor='search'
      >
      <input
  className={cn(
    'peer w-[180px] md:w-[220px] lg:w-[260px] mr-[5px] transform-gpu rounded-full p-2.5 pl-10 transition-all ease-in-out',
    'bg-black hover:bg-black/95',
    'border-none focus:ring-0 outline-none',
    'placeholder-gray-500 focus:placeholder-gray-400'
  )}
  id='search'
  onChange={(e) => setSearchValue(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }}
  placeholder={isLoggedIn ? 'Search...' : 'Log in to search'}
  type='search'
  value={searchValue}
/>

        <SearchIcon className='-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-5 text-gray-500 transition-colors peer-focus:text-blue-500' />
        
        {/* Updated search button */}
        {searchValue && (
          <button
            className='absolute right-0 top-0 bottom-0 px-3 rounded-full text-gray-500 hover:text-blue-500 transition-colors'
            onClick={handleSearch}
            aria-label="Search"
          >
            <SearchIcon size={20} />
          </button>
        )}
      </label>

      {/* Filter controls - Updated for mutual exclusivity */}
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <button
          className={cn(
            "flex items-center gap-1 px-4 py-1.5 rounded-full text-sm transition-colors",
            searchParams.media_type === MediaType.Image 
              ? "bg-blue-500 text-white" 
              : "bg-transparent text-gray-400 border border-gray-700 hover:bg-gray-800"
          )}
          onClick={toggleImageFilter}
        >
          <ImageIcon size={16} /> Images
        </button>
        
        <button
          className={cn(
            "flex items-center gap-1 px-4 py-1.5 rounded-full text-sm transition-colors",
            searchParams.media_type === MediaType.Video 
              ? "bg-blue-500 text-white" 
              : "bg-transparent text-gray-400 border border-gray-700 hover:bg-gray-800"
          )}
          onClick={toggleVideoFilter}
        >
          <VideoIcon size={16} /> Videos
        </button>

        <button
          className={cn(
            "flex items-center gap-1 px-4 py-1.5 rounded-full text-sm transition-colors",
            searchParams.search_users
              ? "bg-blue-500 text-white" 
              : "bg-transparent text-gray-400 border border-gray-700 hover:bg-gray-800"
          )}
          onClick={toggleUserFilter}
        >
          <UserIcon size={16} /> Users
        </button>
      </div>

      {/* Not logged in message */}
      {!isLoggedIn && (
        <div className="text-center py-4 text-gray-500">
          Please log in to use the search feature
        </div>
      )}

      {/* Search results */}
      {searchParams.content && (  // Only show results if there's a search query
        <div className="w-full max-w-3xl">
          {isLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          )}
          
          {isError && (
            <div className="text-center py-10 text-red-500">
              Error: {(error as Error).message || 'Failed to load search results'}
            </div>
          )}
          
          {/* Tweet results */}
          {!searchParams.search_users && tweetSearchData?.data.result.tweets.length === 0 && searchParams.content && !isLoading && (
            <div className="text-center py-10 text-gray-500">
              No tweets found for "{searchParams.content}"
            </div>
          )}
          
          {!searchParams.search_users && (tweetSearchData?.data?.result?.tweets ?? []).length > 0 && (
            <>
              <div className="text-sm text-gray-500 mb-4">
                Found {tweetSearchData?.data?.result?.total_tweets} tweets for "{searchParams.content}"
                {(tweetSearchData?.data?.result?.total_pages > 1) && (
                  <span> (page {searchParams.page} of {tweetSearchData.data.result.total_pages})</span>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                {tweetSearchData.data.result.tweets.map((tweet: Tweets, index) => (
                  <SimpleTweetCard key={tweet._id?.toString() || `tweet-${index}`} tweet={tweet} />
                ))}
              </div>
              
              {/* Pagination for tweets */}
              {tweetSearchData.data.result.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => handlePageChange(searchParams.page - 1)}
                    disabled={searchParams.page === 1}
                    className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 disabled:opacity-50 hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(searchParams.page + 1)}
                    disabled={searchParams.page >= tweetSearchData.data.result.total_pages}
                    className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 disabled:opacity-50 hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* User results */}
          {searchParams.search_users && userSearchData?.data.result.users.length === 0 && searchParams.content && !isLoading && (
            <div className="text-center py-10 text-gray-500">
              No users found for "{searchParams.content}"
            </div>
          )}
          
          {searchParams.search_users && (userSearchData?.data?.result?.users ?? []).length > 0 && (
            <>
              <div className="text-sm text-gray-500 mb-4">
                Found {userSearchData?.data?.result?.total_users} users for "{searchParams.content}"
                {(userSearchData?.data?.result?.total_pages > 1) && (
                  <span> (page {searchParams.page} of {userSearchData.data.result.total_pages})</span>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                {userSearchData.data.result.users.map((user: User, index) => (
                  <SimpleUserCard key={user._id?.toString() || `user-${index}`} user={user} />
                ))}
              </div>
              
              {/* Pagination for users */}
              {userSearchData.data.result.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => handlePageChange(searchParams.page - 1)}
                    disabled={searchParams.page === 1}
                    className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 disabled:opacity-50 hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(searchParams.page + 1)}
                    disabled={searchParams.page >= userSearchData.data.result.total_pages}
                    className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 disabled:opacity-50 hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Replace the TweetCard with a simpler version
const SimpleTweetCard = ({ tweet }: { tweet: TweetWithUser }) => {
  return (
    <div className="p-3 rounded-lg border border-gray-800 bg-black hover:bg-gray-900/30 transition-colors">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={tweet.user?.avatar} alt={tweet.user?.username || ''} />
          <AvatarFallback className="bg-gray-800 text-gray-400">
            {(tweet.user?.name || '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <div className="font-medium text-gray-200">{tweet.user?.name}</div>
          <div className="text-sm text-gray-500 truncate">{tweet.content}</div>
        </div>
      </div>
    </div>
  )
}

// Add a new component for user search results
const SimpleUserCard = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (user.username) {
      navigate(`/${user.username}`);
    }
  };
  
  return (
    <div 
      className="p-3 rounded-lg border border-gray-800 bg-black hover:bg-gray-900/30 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={user.avatar} alt={user.username || ''} />
          <AvatarFallback className="bg-gray-800 text-gray-400">
            {(user.name || '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <div className="font-medium text-gray-200">{user.name}</div>
          <div className="text-sm text-gray-500">@{user.username}</div>
          {user.bio && (
            <div className="text-sm text-gray-300 mt-1 line-clamp-2">{user.bio}</div>
          )}
        </div>
        {user.is_followed !== undefined && (
          <button 
            className={cn(
              "ml-auto self-start px-4 py-1 rounded-full text-sm font-medium",
              user.is_followed 
                ? "bg-transparent border border-gray-600 text-gray-200"
                : "bg-white text-black hover:bg-gray-200"
            )}
            onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking the button
          >
            {user.is_followed ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  )
}
