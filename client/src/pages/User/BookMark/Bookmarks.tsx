import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import bookmarksApi from '../../../apis/bookmarks.api'
import tweetsApi from '../../../apis/tweets.api'
import { Bookmark } from '../../../types/Bookmarks.type'
import { Tweets } from '../../../types/Tweet.type'
import Navigation from '../../../components/Navigation/Navigation'
import RightPart from '../../../components/RightPart'
import TwitterCard from '../HomeSection/TwitterCard/TwitterCard'
import { User } from '@/types/User.type'
import { IoSparkles } from 'react-icons/io5'

interface BookmarkWithTweet extends Bookmark {
  tweetDetails?: Tweets
}

const Bookmarks = () => {
  const [bookmarksWithDetails, setBookmarksWithDetails] = useState<BookmarkWithTweet[]>([])
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Get user profile from localStorage
  useEffect(() => {
    const userProfile = localStorage.getItem('profile')
    if (userProfile) {
      setProfile(JSON.parse(userProfile))
    }
  }, [])

  // Query for bookmarks
  const { data: bookmarksData, refetch: refetchBookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => bookmarksApi.getBookmarks()
  })

  // Fetch tweet details for each bookmark
  useEffect(() => {
    const fetchTweetDetails = async () => {
      if (!bookmarksData?.data?.data) return

      try {
        const bookmarkData = bookmarksData.data.data as Bookmark[]
        const detailedBookmarks = await Promise.all(
          bookmarkData.map(async (bookmark) => {
            try {
              const tweetResponse = await tweetsApi.getTweetDetailsGuest(bookmark.tweet_id)
              return {
                ...bookmark,
                tweetDetails: tweetResponse.data.data
              }
            } catch (error) {
              console.error(`Error fetching tweet ${bookmark.tweet_id}:`, error)
              return bookmark
            }
          })
        )

        setBookmarksWithDetails(detailedBookmarks)
      } catch (error) {
        console.error('Error processing bookmarks:', error)
      } finally {
        setLoading(false)
      }
    }

    if (bookmarksData) {
      fetchTweetDetails()
    }
  }, [bookmarksData])

  return (
    <div className='bg-black flex min-h-screen max-w-[1500px] mx-auto'>
      <Navigation />
      
      <div className='text-white flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px]'>
        <div className='text-[#d9d9d9] flex items-center sm:justify-between py-2 px-3 sticky top-0 z-50 bg-black border-b border-gray-700'>
          <h2 className='text-lg sm:text-xl font-bold'>Bookmarks</h2>
          <div className='hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0 ml-auto'>
            <IoSparkles />
          </div>
        </div>

        <div className='pb-72'>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
              </div>
            </div>
          ) : bookmarksWithDetails.length === 0 ? (
            <div className='text-center py-10'>
              <p className='text-gray-500'>No bookmarks found.</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {bookmarksWithDetails.map((bookmark) => (
                bookmark.tweetDetails ? (
                  <div key={bookmark._id}>
                    <TwitterCard 
                      profile={profile}
                      data={bookmark.tweetDetails}
                      data_length={bookmark.tweetDetails.medias?.length || 0}
                      refetchAllDataTweet={refetchBookmarks}
                    />
                  </div>
                ) : (
                  <div key={bookmark._id} className="p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-500">Unable to load tweet details</p>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
      
      <RightPart />
    </div>
  )
}

export default Bookmarks
