'use client'
import { cn } from '@/lib/utils'
import { SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { searchApi, SearchResult } from '@/apis/search.api'


export default function GrowingSearchVariant1() {
  return (
    <div className='flex flex-col w-full'>
      <SearchBar />
    </div>
  )
}

export const SearchBar = () => {
  const [searchSubmittedOutline, setSearchSubmittedOutline] = useState(false)
  const [searchSubmittedShadow, setSearchSubmittedShadow] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [quickSearchResults, setQuickSearchResults] = useState<SearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSearch() {
  
    setSearchSubmittedOutline(true)
    setSearchSubmittedShadow(true)
    setError(null)
    
    if (searchValue.trim()) {
      searchApi.search({
        content: searchValue,
        limit: 10,
        page: 1
      })
      .then(response => {
      
        const tweets = response?.data?.result?.tweets || []
        toast(`Found ${tweets.length} results for "${searchValue}"`)
      })
      .catch(error => {
        console.error('[DEBUG] Error performing search:', error)
        const errorMessage = error?.message || 'Failed to perform search'
        setError(errorMessage)
        toast.error(errorMessage)
      })
    }
  }

  useEffect(() => {
  
    setError(null)
    
    // Don't make API calls for empty searches
    if (!searchValue.trim()) {
      setQuickSearchResults(null)
      setShowResults(false)
      return;
    }
    
    const debounceTimeout = setTimeout(() => {
      if (searchValue.trim()) {
        setIsSearching(true)
      
        
        searchApi.quickSearch(searchValue)
          .then(response => {
          
            // Add safer checks
            const tweets = response?.data?.result?.tweets || []
            
            if (tweets.length > 0) {
              setQuickSearchResults(response.data)
              setShowResults(true)
            } else {
            
              setQuickSearchResults({
                message: "No results found",
                result: {
                  tweets: [],
                  total_pages: 0,
                  limit: 5,
                  page: 1
                }
              })
            }
            setIsSearching(false)
          })
          .catch(error => {
            console.error('[DEBUG] Error in quick search:', error)
            setIsSearching(false)
            setShowResults(false)
            setQuickSearchResults(null)
            setError(error?.message || 'Search failed')
          })
      }
    }, 300)

    return () => clearTimeout(debounceTimeout)
  }, [searchValue])

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
    <div className="relative w-full">
      <label
        className={cn(
          'relative inline-flex origin-center rounded-full text-neutral-500 dark:text-neutral-400 w-full',
          'group transform-gpu transition-all ease-in-out',
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
            'peer w-full max-w-full transform-gpu rounded-full p-2 pl-10 transition-all ease-in-out',
            'bg-white/70 hover:bg-white/80 dark:bg-neutral-800/70 dark:hover:bg-neutral-900/80',
            '-outline-offset-1 outline outline-1',
            searchSubmittedOutline
              ? 'outline-blue-500 duration-150'
              : 'outline-neutral-200/0 duration-300 hover:outline-neutral-200/100 dark:outline-neutral-800/0 dark:focus:placeholder-neutral-300/100 hover:dark:outline-neutral-800/100',
            ' placeholder-neutral-300/0 focus:placeholder-neutral-300/100 dark:placeholder-neutral-700/0 focus:dark:placeholder-neutral-700/100'
          )}
          id='search'
          onFocus={() => {
         
            if (quickSearchResults) {
              setShowResults(true)
            }
          }}
          onBlur={() => {
           
            setTimeout(() => {
              setShowResults(false)
            }, 200)
          }}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
          
              handleSearch()
            }
          }}
          placeholder='Search'
          type='search'
          value={searchValue}
        />
        <SearchIcon className='-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-5 text-neutral-300 transition-colors peer-focus:text-neutral-500 dark:text-neutral-700' />
      </label>
      
      
      {/* Show "no results" message when search is completed but no results found */}
      {searchValue.trim() && !isSearching && showResults && 
       (!quickSearchResults || !quickSearchResults.result || !quickSearchResults.result.tweets || quickSearchResults.result.tweets.length === 0) && (
        <div className="absolute mt-2 w-full bg-white dark:bg-neutral-800 rounded-md shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">No results found</div>
        </div>
      )}
      
      
      {showResults && quickSearchResults && quickSearchResults.result && quickSearchResults.result.tweets && quickSearchResults.result.tweets.length > 0 && (
        <div className="absolute mt-2 w-full bg-white dark:bg-neutral-800 rounded-md shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="py-1">
            {isSearching ? (
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Searching...</div>
            ) : (
              quickSearchResults.result.tweets.map((tweet) => (
                <div 
                  key={tweet._id} 
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer text-sm text-gray-800 dark:text-gray-200"
                  onClick={() => {
                    console.log("[DEBUG] Tweet item clicked:", tweet.content)
                    setSearchValue(tweet.content)
                    handleSearch()
                  }}
                >
                  {tweet.content.substring(0, 50)}
                  {tweet.content.length > 50 ? '...' : ''}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
