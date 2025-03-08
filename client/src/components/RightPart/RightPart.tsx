/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect, useContext } from 'react'
import { GoVerified } from 'react-icons/go'
import { FaEllipsisH } from 'react-icons/fa'
import SearchGrowing from '../Customs/SearchGrowing'
import Notification from '../Customs/Notification'
import { AppContext } from '@/Contexts/app.context'

const RightPart: React.FC = () => {
  const { profile } = useContext(AppContext)
  const [isModalOpen, setIsModalOpen] = useState<number | null>(null)
  const modalRefs = useRef<(HTMLDivElement | null)[]>([])
  const ellipsisRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleOptionClick = (index: number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (isModalOpen === index) {
      setIsModalOpen(null)
      return
    }

    // Mở modal cho item được chọn
    setIsModalOpen(index)
  }
  // Đóng modal khi click ra ngoài
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
  return (
    <div className='w-full max-w-xs px-4 space-y-5'>
      <Notification userId={profile?._id as string} />
      <SearchGrowing />

      {/* Expiring Section */}
      <div className='bg-blue-800 text-white rounded-xl p-4 space-y-2 '>
        <p className='font-bold'>Expiring soon!</p>
        <p className='text-sm'>Get 40% off X Premium. Unlock the best of X.</p>
        <button className='bg-white text-blue-800 font-semibold px-4 py-2 rounded-full'>Subscribe</button>
      </div>

      {/* What's Happening Section */}
      <div className='bg-black text-white rounded-lg p-4 space-y-3 border border-white/20'>
        <h2 className='font-bold text-lg'>What's happening</h2>
        <div className='space-y-3 relative'>
          {['allegra mccrain', 'sharita sandrowicz', 'elton flockhart', 'petrina boursaw'].map((trend, index) => (
            <div
              key={index}
              className='flex justify-between items-center text-sm hover:bg-gray-700 rounded-lg p-2 relative'
            >
              <div>
                <p className='text-gray-400'>Trending in Vietnam</p>
                <p>{trend}</p>
              </div>
              <div ref={(el) => (ellipsisRefs.current[index] = el)} className='relative'>
                <FaEllipsisH
                  className='ml-2 text-gray-500 text-lg cursor-pointer hover:text-gray-400'
                  onClick={(e) => handleOptionClick(index, e)}
                />

                {/* Modal cho từng item */}
                {isModalOpen === index && (
                  <div
                    ref={(el) => (modalRefs.current[index] = el)}
                    className='absolute z-50 top-full right-0 mt-2 bg-black border border-gray-700 rounded-lg shadow-lg w-52'
                  >
                    <ul className='py-1'>
                      <li
                        className='px-4 py-2 text-sm hover:bg-gray-800 cursor-pointer'
                        onClick={() => handleRemoveTrend('duplicate')}
                      >
                        This trend is duplicate
                      </li>
                      <li
                        className='px-4 py-2 text-sm hover:bg-gray-800 cursor-pointer'
                        onClick={() => handleRemoveTrend('harmful')}
                      >
                        This trend is harmful
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className='text-blue-400 hover:underline'>Show more</button>
      </div>

      {/* Who to Follow Section */}
      <div className='bg-black text-white rounded-lg p-4 space-y-3 border border-white/20'>
        <h2 className='font-bold text-lg'>Who to follow</h2>
        <div className='space-y-3'>
          {[
            { name: 'Viet Nam Government', handle: '@VNGovtPortal' },
            { name: 'Viet Nam Diplomacy', handle: '@MOFAVietNam' },
            { name: 'UK in Viet Nam', handle: '@UKinVietNam' }
          ].map((user, index) => (
            <div key={index} className='flex justify-between items-center text-sm'>
              <div className='flex items-center space-x-2'>
                <div className='w-10 h-10 bg-gray-700 rounded-full'></div>
                <div>
                  <p className='text-white hover:text-blue-400 cursor-pointer'>{user.name}</p>
                  <p className='text-gray-400'>{user.handle}</p>
                </div>
                <GoVerified className='text-blue-500 text-lg' />
              </div>
              <button className='bg-white text-black font-semibold px-4 py-1 rounded-full'>Follow</button>
            </div>
          ))}
        </div>
        <button className='text-blue-400 hover:underline'>Show more</button>
      </div>
    </div>
  )
}

export default RightPart
