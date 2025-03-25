import { useState, useEffect } from 'react'
import bookmarksApi from '../../../apis/bookmarks.api'
import { Bookmark } from '../../../types/Bookmarks.type'
import Navigation from '../../../components/Navigation/Navigation'
import RightPart from '../../../components/RightPart'

// Interface for a tweet with complete data
interface TweetWithDetails {
  _id: string
  content: string
  hashtags: Array<{ _id: string; name: string }>
  medias: Array<{ url: string }>
  created_at: string
  user: {
    name: string
    username: string
    avatar?: string
  }
}

// Extended bookmark interface including tweet details
interface BookmarkWithTweet extends Bookmark {
  tweetDetails?: TweetWithDetails
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkWithTweet[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await bookmarksApi.getBookmarks()
        const bookmarkData = res.data.data || []
        
        // Here you would typically fetch tweet details for each bookmark
        // For now, we'll just set the bookmarks without tweet details
        setBookmarks(bookmarkData)
        
        // Example of how you might fetch tweet details:
        // const bookmarksWithTweets = await Promise.all(
        //   bookmarkData.map(async (bookmark) => {
        //     try {
        //       // You would need to implement this API endpoint
        //       const tweetRes = await tweetsApi.getTweetById(bookmark.tweet_id)
        //       return { ...bookmark, tweetDetails: tweetRes.data.data }
        //     } catch (error) {
        //       console.error(`Error fetching tweet ${bookmark.tweet_id}:`, error)
        //       return bookmark
        //     }
        //   })
        // )
        // setBookmarks(bookmarksWithTweets)
        
      } catch (error) {
        console.error('Error fetching bookmarks:', error)
        setBookmarks([])
      } finally {
        setLoading(false)
      }
    }
    fetchBookmarks()
  }, [])

  return (
    <div className='flex w-screen px-5 lg:px-0 justify-between'>
      <div className='lg:block lg:w-3/12 w-full relative transition-all duration-300'>
        <Navigation />
      </div>
      <div className='lg:w-5/12 w-full relative'>
        <h2 className='text-2xl font-bold mb-6'>Bookmarks</h2>
        
        {loading ? (
          <p>Loading bookmarks...</p>
        ) : bookmarks.length === 0 ? (
          <p className='text-gray-500'>No bookmarks found.</p>
        ) : (
          <ul className='space-y-6'>
            {bookmarks.map((bookmark) => (
              <li
                key={bookmark._id}
                className='p-4 border border-gray-200 rounded-lg shadow-md bg-white hover:bg-gray-50 transition-colors'
              >
                {bookmark.tweetDetails ? (
                  // Display tweet with details if available
                  <>
                    {/* Tweet User Info */}
                    <div className='flex items-center mb-2'>
                      <div className='flex flex-col items-center pr-2'>
                        <button className='flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 cursor-pointer overflow-hidden'>
                          {bookmark.tweetDetails.user.avatar ? (
                            <img src={bookmark.tweetDetails.user.avatar} alt='User Avatar' className='w-full h-full object-cover' />
                          ) : (
                            <span className='text-lg font-bold text-gray-700'>
                              {bookmark.tweetDetails.user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </button>
                      </div>
                      <div>
                        <p className='font-semibold text-sm'>{bookmark.tweetDetails.user.name}</p>
                        <p className='text-xs text-gray-500'>@{bookmark.tweetDetails.user.username || 'username'}</p>
                      </div>
                    </div>

                    {/* Tweet Content */}
                    <p className='text-gray-800 mb-2'>{bookmark.tweetDetails.content}</p>

                    {/* Hashtags */}
                    {bookmark.tweetDetails.hashtags?.length > 0 && (
                      <div className='flex flex-wrap gap-2 mb-2'>
                        {bookmark.tweetDetails.hashtags.map((hashtag) => (
                          <span key={hashtag._id} className='text-blue-500 text-sm hover:underline cursor-pointer'>
                            #{hashtag.name.replace('#', '')}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Medias */}
                    {bookmark.tweetDetails.medias?.length > 0 && (
                      <div className='mb-2'>
                        {bookmark.tweetDetails.medias.map((media, index) => (
                          <img
                            key={index}
                            src={media.url}
                            alt='Tweet media'
                            className='w-full h-64 object-cover rounded-md'
                          />
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className='text-xs text-gray-500'>
                      {new Date(bookmark.tweetDetails.created_at).toLocaleDateString()} at{' '}
                      {new Date(bookmark.tweetDetails.created_at).toLocaleTimeString()}
                    </p>
                  </>
                ) : (
                  // Display minimal information when tweet details aren't available
                  <div>
                    <p className='text-gray-500'>Tweet ID: {bookmark.tweet_id}</p>
                    <p className='text-xs text-gray-500'>Bookmarked on: {new Date(bookmark.created_at).toLocaleString()}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Rightpart */}
      <div className='hidden lg:block lg:w-4/12 w-full relative'>
        <RightPart />
      </div>
    </div>
  )
}

export default Bookmarks
