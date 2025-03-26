/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect, useContext } from 'react'
import { HiOutlineBadgeCheck } from 'react-icons/hi'
import { BiDotsHorizontalRounded, BiTrendingUp, BiSearch } from 'react-icons/bi'
import { AppContext } from '@/Contexts/app.context'
import { Link, useNavigate } from 'react-router-dom'
import path from '@/constants/path'
import userApi from '@/apis/users.api'
import SearchGrowing from '../Customs/SearchGrowing'
import useNotifications from '../Customs/Notification/useNotifications/useNotifications'
import { ActionType } from '@/types/Notifications.types'

// Định nghĩa kiểu dữ liệu cho Suggested User (dựa trên dữ liệu từ API)
interface SuggestedUser {
  _id: string
  name: string
  handle: string
  avatar: string | null
  verified: boolean
}

const RightPart: React.FC = () => {
  const { profile } = useContext(AppContext)
  const [isModalOpen, setIsModalOpen] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const modalRefs = useRef<(HTMLDivElement | null)[]>([])
  const ellipsisRefs = useRef<(HTMLDivElement | null)[]>([])
  const { createNotification } = useNotifications({ userId: profile?._id || '', limit: 10 })
  // State để lưu danh sách người dùng từ API
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [following, setFollowing] = useState<string[]>([])
  const navigate = useNavigate()

  // Lấy danh sách người dùng đang follow khi component mount
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await userApi.getFollowing()
        const followingIds = response.data.result.map((user: any) => user.followed_user_id.toString())
        setFollowing(followingIds)
      } catch (err) {
        console.error('Error fetching following list:', err)
      }
    }

    fetchFollowing()
  }, [])

  // Gọi API getAllUsers khi component được mount
  useEffect(() => {
    const fetchSuggestedUsers = async (pageNum: number) => {
      try {
        setLoading(true)
        setError(null)
        const response = await userApi.getAllUsers(pageNum, 10)
        const users = response.data.result.users
          .map((user: any) => ({
            _id: user._id,
            name: user.name,
            handle: `@${user.email.split('@')[0]}`,
            avatar: user.avatar || '/avatars/default.jpg',
            verified: false
          }))
          .slice(0, 5)
        setSuggestedUsers(users)
      } catch (err) {
        console.error('Error fetching suggested users:', err)
        setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedUsers(page)
  }, [page])

  const handleOptionClick = (index: number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (isModalOpen === index) {
      setIsModalOpen(null)
      return
    }
    setIsModalOpen(index)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = ellipsisRefs.current.every(
        (ref, index) =>
          ref &&
          !ref.contains(event.target as Node) &&
          modalRefs.current[index] &&
          !modalRefs.current[index]?.contains(event.target as Node)
      )

      if (isOutside) {
        setIsModalOpen(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleRemoveTrend = (option: string) => {
    setIsModalOpen(null)
  }

  const handleWhoToFollow = () => {
    navigate('/user/who-to-follow')
  }

  const trendingTopics = [
    { name: 'Technology', category: 'Trending in Tech', count: '5.2K posts' },
    { name: 'Science', category: 'Trending in Education', count: '3.8K posts' },
    { name: 'Health', category: 'Trending in Wellness', count: '2.9K posts' },
    { name: 'Art', category: 'Trending in Culture', count: '1.7K posts' }
  ]

  // Xử lý follow/unfollow
  const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        // Unfollow
        createNotification({
          recipientId: userId,
          actionType: ActionType.UNFOLLOW,
          targetId: profile?._id ? [profile._id] : [],
          content: `${profile?.name || profile?.username} unfollowed you`
        })
        await userApi.unfollowUser(userId)
        setFollowing((prev) => prev.filter((id) => id !== userId))
      } else {
        // Follow
        createNotification({
          recipientId: userId,
          actionType: ActionType.FOLLOW,
          targetId: profile?._id ? [profile._id] : [],
          content: `${profile?.name || profile?.username} followed you`
        })
        await userApi.followUser(userId)
        setFollowing((prev) => [...prev, userId])
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
      alert('Không thể thực hiện hành động này. Vui lòng thử lại.')
    }
  }

  return (
    <div className='sticky hidden sm:flex flex-col p-2 h-full gap-3 xl:w-[340px]'>
      <SearchGrowing />

      <div className='bg-gray-900 border-b border-gray-700 rounded-xl p-5 text-white shadow-md'>
        <h2 className='font-bold text-lg mb-2'>Unlock Premium Features</h2>
        <p className='text-gray-300 text-sm mb-4'>Get exclusive tools, analytics, and customization options.</p>
        <div className='space-y-2 mb-4'>
          <div className='flex items-center gap-2 text-sm'>
            <svg className='h-5 w-5 text-gray-400' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span>Ad-free experience</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <svg className='h-5 w-5 text-gray-400' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span>Enhanced analytics</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <svg className='h-5 w-5 text-gray-400' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span>Priority support</span>
          </div>
        </div>
        <Link to={path.subscription}>
          <button className='w-full bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors'>
            Upgrade Now
          </button>
        </Link>
      </div>

      <div className='bg-gray-900 border-b rounded-xl shadow-sm border border-gray-700 overflow-hidden'>
        <div className='p-4 border-b border-gray-700'>
          <h2 className='font-bold text-gray-200'>Suggested Connections</h2>
        </div>

        {/* Hiển thị trạng thái loading hoặc lỗi */}
        {loading && (
          <div className='p-4 text-center text-gray-400'>
            <p>Loading...</p>
          </div>
        )}
        {error && (
          <div className='p-4 text-center text-red-400'>
            <p>{error}</p>
          </div>
        )}

        {/* Hiển thị danh sách người dùng từ API */}
        {!loading && !error && suggestedUsers.length === 0 && (
          <div className='p-4 text-center text-gray-400'>
            <p>No suggested users found.</p>
          </div>
        )}

        {!loading && !error && suggestedUsers.length > 0 && (
          <div className='divide-y divide-gray-700'>
            {suggestedUsers.map((user, index) => {
              // Kiểm tra xem user có đang được theo dõi hay không
              const isFollowing = following.includes(user._id)

              return (
                <div key={user._id} className='p-4 hover:bg-gray-800 transition-colors duration-150'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden'>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
                        ) : (
                          <div className='w-full h-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-indigo-200'>
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className='flex items-center gap-1'>
                          <p className='font-medium text-sm text-gray-200'>{user.name}</p>
                          {user.verified && <HiOutlineBadgeCheck className='text-indigo-400 h-4 w-4' />}
                        </div>
                        <p className='text-sm text-gray-400'>{user.handle}</p>
                      </div>
                    </div>

                    {/* Nút Follow/Unfollow */}
                    <button
                      onClick={() => handleFollowToggle(user._id, isFollowing)}
                      disabled={loading}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                        isFollowing
                          ? 'bg-gray-600 text-gray-400 hover:bg-gray-500 hover:text-gray-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className='p-3 bg-gray-800 border-t border-gray-700'>
          <button
            onClick={handleWhoToFollow}
            className='w-full text-center text-sm text-indigo-400 font-medium hover:underline py-1'
          >
            Show more suggestions
          </button>
        </div>
      </div>

      <div className='text-xs text-gray-500'>
        <div className='flex flex-wrap gap-x-3 gap-y-1 mb-2 justify-center'>
          <a href='#' className='hover:underline'>
            Terms
          </a>
          <a href='#' className='hover:underline'>
            Privacy
          </a>
          <a href='#' className='hover:underline'>
            Cookies
          </a>
          <a href='#' className='hover:underline'>
            Accessibility
          </a>
          <a href='#' className='hover:underline'>
            Advertising
          </a>
        </div>
        <p className='text-center'>© 2025 Flow Friend, Inc.</p>
      </div>
    </div>
  )
}

export default RightPart
