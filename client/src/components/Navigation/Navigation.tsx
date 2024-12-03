import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEllipsisH } from 'react-icons/fa'
import NavigationMenu from './NavigationMenu'

const Navigation = () => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showTitles, setShowTitles] = useState(true)

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  const handleLogOut = () => {
    console.log('Log Out')
  }

  const handleSignIn = () => {
    console.log('Sign In')
  }

  const toggleTitlesVisibility = () => {
    setShowTitles(!showTitles)
  }

  return (
    <div className='pl-6 relative'>
      <div className='h-screen sticky top-0'>
        <div className='py-5 pl-3'>
          <svg fill='white' height='28' width='28' viewBox='0 0 24 24' aria-hidden='true' className='block'>
            <g>
              <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'></path>
            </g>
          </svg>
        </div>

        <div className='space-y-2.5'>
          {NavigationMenu.map((item, index) => (
            <div
              key={index}
              className={`
                cursor-pointer 
                flex 
                items-center 
                space-x-3 
                hover:bg-gray-700 
                hover:shadow-md 
                hover:border 
                transition-all 
                duration-300 
                px-3 
                py-2 
                rounded-full 
                border 
                border-transparent
                ${showTitles ? 'w-full' : 'w-fit justify-center'}
              `}
              onClick={() => (item.title === 'Profile' ? navigate(`/profile/${5}`) : navigate(item.path))}
            >
              <span className='text-2xl'>{item.icon}</span>
              <p
                className={`
                  text-base 
                  transition-all 
                  duration-300 
                  ease-in-out
                  ${showTitles ? 'opacity-100 max-w-full visible' : 'opacity-0 max-w-0 invisible absolute'}
                `}
              >
                {item.title}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`
            py-6 
            transition-all 
            duration-300 
            ease-in-out 
            overflow-hidden
            ${showTitles ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <button
            className={`
              w-60 
              rounded-[25px] 
              py-3 
              bg-[#1e88e5] 
              text-white 
              hover:bg-[#1565c0] 
              text-base
              transition-all 
              duration-300
              ${showTitles ? 'scale-100' : 'scale-0'}
            `}
          >
            Post
          </button>
        </div>

        <div
          className={`
            flex 
            items-center 
            space-x-3 
            px-3 
            py-2 
            rounded-full 
            hover:bg-gray-700 
            hover:shadow-md 
            hover:border 
            transition-all 
            duration-300 
            cursor-pointer 
            border 
            border-transparent
            ${showTitles ? 'w-full' : 'w-fit justify-center'}
          `}
          onClick={toggleModal}
        >
          <div className='w-12 h-12 rounded-full overflow-hidden'>
            <img
              src='https://anhtoc.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-2.webp'
              alt='Avatar'
              className='w-full h-full object-cover'
            />
          </div>
          <div
            className={`
              transition-all 
              duration-300 
              ease-in-out 
              overflow-hidden
              ${showTitles ? 'opacity-100 max-w-full visible' : 'opacity-0 max-w-0 invisible absolute'}
            `}
          >
            <span className='text-base font-semibold block'>Vũ Hiếu</span>
            <span className='opacity-70 text-sm block'>@Vuhieu123</span>
          </div>
          <FaEllipsisH className='ml-2 text-gray-500 text-lg' />
        </div>

        {isModalOpen && (
          <div className='bottom-12 right-0 bg-gray-800 shadow-md rounded-lg px-4 py-3 w-52 relative'>
            <div className='absolute top-2 right-5 w-4 h-4 bg-gray-800 rotate-45'></div>
            <ul className='space-y-2'>
              <li
                className='text-sm bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 text-center'
                onClick={handleSignIn}
              >
                Add an existing account
              </li>
              <li
                className='text-sm bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 text-center'
                onClick={handleLogOut}
              >
                Logout
              </li>
            </ul>
          </div>
        )}

        <button
          className='absolute bottom-24 left-6 bg-blue-500 text-white px-3 py-2 rounded-full'
          onClick={toggleTitlesVisibility}
        >
          {showTitles ? 'Hide Titles' : 'Show Titles'}
        </button>
      </div>
    </div>
  )
}

export default Navigation
