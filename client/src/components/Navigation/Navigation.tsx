import { useState } from 'react'
import { FaEllipsisH } from 'react-icons/fa'
import NavigationMenu from './NavigationMenu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
const Navigation = () => {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')
  const [showTitles, setShowTitles] = useState(true)

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
            <Link
              to={item.path}
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
            </Link>
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
        >
          <div className='w-12 h-12 rounded-full overflow-hidden'>
            <Avatar>
              <AvatarImage src={profile?.avatar} alt='@shadcn' />
              <AvatarFallback className='bg-blue-100 text-blue-500'>
                {profile?.username?.split('')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div
                className={`
              transition-all 
              duration-300 
              ease-in-out 
              overflow-hidden
              ${showTitles ? 'opacity-100 max-w-full visible' : 'opacity-0 max-w-0 invisible absolute'}
            `}
              >
                <span className='opacity-70 text-sm block'>{profile.username}</span>
              </div>
              <FaEllipsisH className='ml-2 text-gray-500 text-lg' />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className='cursor-pointer'>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='cursor-pointer'>Profile</DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>Messages</DropdownMenuItem>

              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
