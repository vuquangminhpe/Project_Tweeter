import { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppContext } from '@/Contexts/app.context'
import TwitterCard from '../HomeSection/TwitterCard/TwitterCard'
import searchApis from '@/apis/search.api'
import { SearchRequest } from '@/types/Search.type'
import { MediaType } from '@/constants/enum'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageIcon, VideoIcon, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/Components/ui/button'
import { SearchBarWithResults } from '@/components/Customs/SearchGrowing/SearchGrowing'

const SearchPage = () => {
  const { profile } = useContext(AppContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('all')

  // Parse search params from URL
  const queryParams = new URLSearchParams(location.search)
  const searchQuery = queryParams.get('q') || ''
  const mediaTypeParam = queryParams.get('media_type')
  
  // Set up search parameters
  const [searchParams, setSearchParams] = useState<SearchRequest>({
    content: searchQuery,
    limit: 10,
    page: 1,
    media_type: mediaTypeParam === 'image' 
      ? MediaType.Image 
      : mediaTypeParam === 'video' 
        ? MediaType.Video 
        : undefined
  })

  // Update state when URL params change
  useEffect(() => {
    setSearchParams(prev => ({
      ...prev,
      content: searchQuery,
      media_type: mediaTypeParam === 'image' 
        ? MediaType.Image 
        : mediaTypeParam === 'video' 
          ? MediaType.Video 
          : undefined,
      page: 1 // Reset page when search changes
    }))
  }, [searchQuery, mediaTypeParam])

  // Set active tab based on media type
  useEffect(() => {
    if (mediaTypeParam === 'image') {
      setActiveTab('images')
    } else if (mediaTypeParam === 'video') {
      setActiveTab('videos')
    } else {
      setActiveTab('all')
    }
  }, [mediaTypeParam])

  // Fetch search results
  const {
    data: searchData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['searchPage', searchParams],
    queryFn: () => searchApis.search(searchParams),
    enabled: !!searchParams.content,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    let newMediaType: MediaType | undefined
    if (value === 'images') {
      newMediaType = MediaType.Image
    } else if (value === 'videos') {
      newMediaType = MediaType.Video
    } else {
      newMediaType = undefined
    }
    
    // Update URL parameters
    const params = new URLSearchParams(location.search)
    if (newMediaType !== undefined) {
      params.set('media_type', newMediaType === MediaType.Image ? 'image' : 'video')
    } else {
      params.delete('media_type')
    }
    
    navigate(`/user/search?${params.toString()}`)
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (searchData?.data.result && (newPage < 1 || newPage > searchData.data.result.total_pages)) {
      return
    }
    
    setSearchParams(prev => ({
      ...prev,
      page: newPage
    }))
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Search Results</h1>
        
        {/* Embedded search bar for refining search */}
        <div className="mb-6">
          <SearchBarWithResults isLoggedIn={true} />
        </div>

        {/* Tab navigation for filtering results */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full p-0 h-12 bg-gray-50 rounded-none border-b">
            <TabsTrigger
              value="all"
              className="flex-1 h-full data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600"
            >
              All Results
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="flex-1 h-full data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600"
            >
              <ImageIcon size={16} className="mr-2" /> Images
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="flex-1 h-full data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600"
            >
              <VideoIcon size={16} className="mr-2" /> Videos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search results display */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Search metadata */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          {searchParams.content && !isLoading && !isError && (
            <div>
              <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                {searchData?.data.result?.total_tweets || 0} results
              </Badge>
              <span className="ml-2 text-gray-500">
                for "<span className="font-medium">{searchParams.content}</span>"
              </span>
              {activeTab !== 'all' && (
                <Badge className="ml-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                  {activeTab === 'images' ? 'Images only' : 'Videos only'}
                </Badge>
              )}
            </div>
          )}
          {!searchParams.content && (
            <div className="text-gray-500">Enter a search term to find tweets</div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-10">
            <div className="text-red-500 mb-2">Error loading search results</div>
            <div className="text-gray-500 text-sm">{(error as Error).message}</div>
            <Button 
              variant="outline" 
              className="mt-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* No results */}
        {searchData?.data.result?.tweets.length === 0 && searchParams.content && !isLoading && !isError && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-5xl mb-4">¯\_(ツ)_/¯</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No matching tweets found</h3>
            <p className="text-gray-500 mb-4">Try using different keywords or removing filters</p>
          </div>
        )}

        {/* Results display */}
        {searchData?.data.result?.tweets && searchData.data.result.tweets.length > 0 && (
          <div className="divide-y">
            {searchData.data.result.tweets.map((tweet) => (
              <TwitterCard 
                key={tweet._id} 
                profile={profile}
                data={tweet}
                data_length={tweet.medias?.length || 0}
                refetchAllDataTweet={refetch}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {searchData?.data.result?.total_pages > 1 && (
          <div className="flex justify-center py-6 border-t border-gray-100">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={searchParams.page <= 1}
                onClick={() => handlePageChange(searchParams.page - 1)}
              >
                Previous
              </Button>
              
              <div className="flex items-center px-4 text-sm">
                Page {searchParams.page} of {searchData.data.result.total_pages}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={searchParams.page >= searchData.data.result.total_pages}
                onClick={() => handlePageChange(searchParams.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage