/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect, useContext } from 'react'
import { HiOutlineBadgeCheck } from 'react-icons/hi'
import { BiDotsHorizontalRounded, BiTrendingUp, BiSearch } from 'react-icons/bi'
import SearchGrowing from '../Customs/SearchGrowing'
import Notification from '../Customs/Notification'
import { AppContext } from '@/Contexts/app.context'

const RightPart: React.FC = () => {
  const { profile } = useContext(AppContext)
  const [isModalOpen, setIsModalOpen] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const modalRefs = useRef<(HTMLDivElement | null)[]>([])
  const ellipsisRefs = useRef<(HTMLDivElement | null)[]>([])

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

  const trendingTopics = [
    { name: 'Technology', category: 'Trending in Tech', count: '5.2K posts' },
    { name: 'Science', category: 'Trending in Education', count: '3.8K posts' },
    { name: 'Health', category: 'Trending in Wellness', count: '2.9K posts' },
    { name: 'Art', category: 'Trending in Culture', count: '1.7K posts' }
  ]

  const suggestedAccounts = [
    { name: 'Innovation Hub', handle: '@InnovationHub', avatar: '/avatars/hub.jpg', verified: true },
    { name: 'Tech Times', handle: '@TechTimes', avatar: '/avatars/tech.jpg', verified: true },
    { name: 'Design World', handle: '@DesignWorld', avatar: '/avatars/design.jpg', verified: false }
  ]

  return (
    <div className='space-y-6 py-4'>
      <Notification userId={profile?._id as string} />
      <SearchGrowing />
      <div className='relative group'>
        <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
          <BiSearch className='h-5 w-5 text-gray-400' />
        </div>
        <input
          type='text'
          placeholder='Search PulseVibe'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='bg-gray-100 w-full pl-10 pr-4 py-3 rounded-xl text-sm border-transparent
          focus:bg-white focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
          transition-all duration-200'
        />
      </div>

      <div className='bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-5 text-white shadow-md'>
        <h2 className='font-bold text-lg mb-2'>Unlock Premium Features</h2>
        <p className='text-indigo-100 text-sm mb-4'>Get exclusive tools, analytics, and customization options.</p>
        <div className='space-y-2 mb-4'>
          <div className='flex items-center gap-2 text-sm'>
            <svg className='h-5 w-5 text-indigo-200' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span>Ad-free experience</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <svg className='h-5 w-5 text-indigo-200' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span>Enhanced analytics</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <svg className='h-5 w-5 text-indigo-200' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span>Priority support</span>
          </div>
        </div>
        <button className='w-full bg-white text-indigo-700 font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors'>
          Upgrade Now
        </button>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='p-4 border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            <h2 className='font-bold text-gray-800 flex items-center gap-2'>
              <BiTrendingUp className='text-indigo-500' />
              Trending Now
            </h2>
            <button className='text-xs text-indigo-600 font-medium hover:underline'>View All</button>
          </div>
        </div>

        <div className='divide-y divide-gray-100'>
          {trendingTopics.map((trend, index) => (
            <div key={index} className='p-4 hover:bg-gray-50 transition-colors duration-150 relative'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='text-xs text-gray-500 mb-1'>{trend.category}</p>
                  <p className='font-medium text-gray-800 mb-1'>{trend.name}</p>
                  <p className='text-xs text-gray-500'>{trend.count}</p>
                </div>
                <div ref={(el) => (ellipsisRefs.current[index] = el)} className='relative'>
                  <button
                    className='p-1 rounded-full hover:bg-gray-200 transition-colors'
                    onClick={(e) => handleOptionClick(index, e)}
                  >
                    <BiDotsHorizontalRounded className='text-gray-500' />
                  </button>

                  {isModalOpen === index && (
                    <div
                      ref={(el) => (modalRefs.current[index] = el)}
                      className='absolute z-50 top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-56 overflow-hidden'
                    >
                      <div className='py-1'>
                        <button
                          className='w-full px-4 py-2 text-sm text-left hover:bg-gray-100 text-gray-700 flex items-center gap-2'
                          onClick={() => handleRemoveTrend('not-interested')}
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                          Not interested
                        </button>
                        <button
                          className='w-full px-4 py-2 text-sm text-left hover:bg-gray-100 text-gray-700 flex items-center gap-2'
                          onClick={() => handleRemoveTrend('report')}
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                            />
                          </svg>
                          Report this trend
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='p-4 border-b border-gray-100'>
          <h2 className='font-bold text-gray-800'>Suggested Connections</h2>
        </div>

        <div className='divide-y divide-gray-100'>
          {suggestedAccounts.map((user, index) => (
            <div key={index} className='p-4 hover:bg-gray-50 transition-colors duration-150'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden'>
                    <div className='w-full h-full bg-gradient-to-br from-indigo-200 to-violet-200 flex items-center justify-center text-indigo-500'>
                      {user.name.charAt(0)}
                    </div>
                  </div>

                  <div>
                    <div className='flex items-center gap-1'>
                      <p className='font-medium text-gray-900'>{user.name}</p>
                      {user.verified && <HiOutlineBadgeCheck className='text-indigo-500 h-4 w-4' />}
                    </div>
                    <p className='text-sm text-gray-500'>{user.handle}</p>
                  </div>
                </div>

                <button className='px-3 py-1 text-sm font-medium rounded-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors'>
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className='p-3 bg-gray-50 border-t border-gray-100'>
          <button className='w-full text-center text-sm text-indigo-600 font-medium hover:underline py-1'>
            Show more suggestions
          </button>
        </div>
      </div>

      <div className='text-xs text-gray-500'>
        <div className='flex flex-wrap gap-x-3 gap-y-1 mb-2'>
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
        <p>© 2025 Flow Friend, Inc.</p>
      </div>
    </div>
  )
}

export default RightPart
