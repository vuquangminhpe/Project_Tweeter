import React from 'react'
import { CiRepeat } from 'react-icons/ci'

const TwitterCard = () => {
  return (
    <div className=''>
      {/* <div className='flex items-center font-semibold text-gray-700 py-2'>
        <CiRepeat />
        <p>You Retweet</p>
      </div> */}
      <div className='flex space-x-5'>
        <div className='w-12 h-12 rounded-full overflow-hidden'>
          <img
            src='https://anhtoc.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-2.webp'
            alt='Avatar'
            className='w-full h-full object-cover'
          />
        </div>
      </div>
    </div>
  )
}

export default TwitterCard
