'use client'
import searchApis, { SearchResponse } from '@/apis/search.api'
import { cn } from '@/lib/utils'
import { MediaType } from '@/constants/enum'
import { SearchRequest } from '@/types/Search.type'
import { Tweets } from '@/types/Tweet.type'
import { useQuery } from '@tanstack/react-query'
import { SearchIcon, ImageIcon, VideoIcon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from 'react-router-dom'


type User = {
  _id?: string
  name?: string
  username?: string
  avatar?: string
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
    media_type: undefined
  })

  // Apply debounce to search input with 500ms delay
  const debouncedSearchValue = useDebounce(searchValue, 500)

  // Auto-search effect that runs when debounced search value changes
  useEffect(() => {
    if (debouncedSearchValue.trim()) {
      if (!isLoggedIn) {
        toast.error("Please log in to search tweets")
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
    data: searchData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['search', searchParams],
    queryFn: () => searchApis.search(searchParams),
    enabled: !!searchParams.content && isLoggedIn, // Only enable if logged in and has search content
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  // Updated handleSearch function with navigation
  function handleSearch() {
    setSearchSubmittedOutline(true)
    setSearchSubmittedShadow(true)
    
    if (!searchValue.trim()) {
      toast.warning('Please enter a search term')
      return
    }
    
    if (!isLoggedIn) {
      toast.error("Please log in to search tweets")
      return
    }
    
    // Update local search params
    setSearchParams(prev => ({
      ...prev,
      content: searchValue,
      page: 1
    }))
    
    // Navigate to search page with query parameters
    const mediaTypeParam = searchParams.media_type !== undefined ? 
      `&media_type=${searchParams.media_type === MediaType.Image ? 'image' : 'video'}` : '';
    
    navigate(`/user/search?q=${encodeURIComponent(searchValue)}${mediaTypeParam}`);
  }

  // Create more explicit filter toggle functions
  function toggleImageFilter() {
    if (!isLoggedIn) {
      toast.error("Please log in to use search filters")
      return
    }
    
    setSearchParams(prev => ({
      ...prev,
      media_type: prev.media_type === MediaType.Image ? undefined : MediaType.Image,
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
      page: 1 // Reset to first page on filter change
    }))
  }

  function handlePageChange(newPage: number) {
    if (!isLoggedIn) {
      toast.error("Please log in to browse more results")
      return
    }
    
    if (newPage < 1 || (searchData?.data.result.total_pages && newPage > searchData.data.result.total_pages)) {
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
          'relative inline-flex origin-center rounded-full text-neutral-950 dark:text-neutral-400',
          'group transform-gpu transition-all ease-in-out',
          'relative border-2 border-transparent focus-within:border-blue-400',
          "before:absolute before:top-0 before:left-0 before:h-full before:w-full before:transform-gpu before:rounded-full before:transition-all before:duration-700 before:ease-in-out before:content-['']",
          searchSubmittedShadow
            ? 'before:shadow-[0px_0px_0px_5px_blue] before:blur-2xl'
            : 'before:shadow-[0px_0px_1px_0px_#FFFFFF00] before:blur-0',
          searchSubmittedOutline ? 'scale-90 duration-75' : 'duration-300 hover:scale-105'
        )}
        htmlFor='search'
      >
        <input
          className={cn(
            'peer w-[250px] md:w-[300px] lg:w-[350px] transform-gpu rounded-full p-2 pl-10 transition-all ease-in-out',
            'bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800',
            '-outline-offset-1 outline outline-1',
            searchSubmittedOutline
              ? 'outline-blue-500 duration-150'
              : 'outline-neutral-200/70 duration-300 hover:outline-neutral-300 dark:outline-neutral-700/70 dark:focus:placeholder-neutral-300/100 hover:dark:outline-neutral-600',
            'placeholder-neutral-400 focus:placeholder-neutral-500 dark:placeholder-neutral-600 focus:dark:placeholder-neutral-500'
          )}
          id='search'
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          placeholder={isLoggedIn ? 'Search tweets...' : 'Log in to search tweets'}
          type='search'
          value={searchValue}
        />
        <SearchIcon className='-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-5 text-neutral-400 transition-colors peer-focus:text-blue-500 dark:text-neutral-500 dark:peer-focus:text-blue-400' />
        
        {/* Updated search button */}
        {searchValue && (
          <button
            className='absolute right-0 top-0 bottom-0 px-3 rounded-full text-neutral-500 hover:text-blue-500 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors'
            onClick={handleSearch}
            aria-label="Search"
          >
            <SearchIcon size={20} />
          </button>
        )}
      </label>

      {/* Filter controls */}
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <button
          className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full text-sm",
            searchParams.media_type === MediaType.Image ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-neutral-800"
          )}
          onClick={toggleImageFilter}
        >
          <ImageIcon size={16} /> Images
        </button>
        
        <button
          className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full text-sm",
            searchParams.media_type === MediaType.Video ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-neutral-800"
          )}
          onClick={toggleVideoFilter}
        >
          <VideoIcon size={16} /> Videos
        </button>
      </div>

      {/* Not logged in message */}
      {!isLoggedIn && (
        <div className="text-center py-4 text-neutral-500">
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
          
          {searchData?.data.result.tweets.length === 0 && searchParams.content && !isLoading && (
            <div className="text-center py-10 text-neutral-500">
              No results found for "{searchParams.content}"
            </div>
          )}
          
          {(searchData?.data?.result?.tweets ?? []).length > 0 && (
            <>
              <div className="text-sm text-neutral-500 mb-4">
                Found {searchData?.data?.result?.total_tweets} results for "{searchParams.content}"
                {(searchData?.data?.result?.total_pages ?? 0) > 1 && (
                  <span> (page {searchParams.page} of {searchData?.data?.result?.total_pages})</span>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                {searchData?.data?.result?.tweets?.map((tweet: Tweets, index) => (
                  <SimpleTweetCard key={tweet._id?.toString() || `tweet-${index}`} tweet={tweet} />
                ))}
              </div>
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
    <div className="p-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={tweet.user?.avatar} alt={tweet.user?.username || ''} />
          <AvatarFallback className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            {(tweet.user?.name || '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <div className="font-medium">{tweet.user?.name}</div>
          <div className="text-sm text-neutral-500 truncate">{tweet.content}</div>
        </div>
      </div>
    </div>
  )
}
