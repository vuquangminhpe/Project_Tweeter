import { useState, useEffect } from 'react'
import NavigationMenu from './NavigationMenu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { clearLocalStorage } from '@/utils/auth'
// Import Sonner toast
import { toast } from 'sonner'

const Navigation = () => {
  const [showTitles, setShowTitles] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    checkAuthStatus()

    // Listen for clearLocalStorage event
    const handleStorageChange = () => {
      checkAuthStatus()
    }

    document.addEventListener('clearLocalStorage', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      document.removeEventListener('clearLocalStorage', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const checkAuthStatus = () => {
    const hasToken = localStorage.getItem('access_token') !== null
    const hasProfile = localStorage.getItem('profile') !== null



    setIsAuthenticated(hasToken && hasProfile)
  }

  // Add this new useEffect to check auth status when the component renders
  useEffect(() => {
    // Check auth on initial render
    checkAuthStatus()

    // Set up an interval to periodically check auth status
    const checkInterval = setInterval(checkAuthStatus, 2000)

    return () => clearInterval(checkInterval)
  }, [])

  const toggleTitlesVisibility = () => {
    setShowTitles(!showTitles)
  }

  const handleLogout = () => {
    try {
      clearLocalStorage()
      setIsAuthenticated(false)

      // Use default Sonner toast without options
      toast.success('Logged out successfully')

      // Add a short delay to ensure notification is visible before reload
      setTimeout(() => {
        window.location.href = '/' // Navigate to root and force a complete reload
      }, 300)
    } catch (error) {
      console.error('Logout error:', error)
      // Use default error toast
      toast.error('Failed to logout. Please try again.')
    }
  }

  const handleLogin = () => {
    navigate('/auth/login')
  }

  const handleChat = () => {
    navigate('/user/chat')
  }
  // Get profile data if authenticated
  const profile = isAuthenticated ? JSON.parse(localStorage.getItem('profile') || '{}') : {}

  return (
    <div
      className={`
      pl-1 relative 
      ${showTitles ? 'lg:w-72 md:w-60 sm:w-48 w-16' : 'w-20'}
      transition-all duration-300
    `}
    >
      {/* Remove custom notification component - it's replaced by Sonner */}

      <div className='h-screen sticky top-0'>
        <div className='py-5 flex items-center justify-center lg:pl-3'>
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
              ${showTitles ? 'w-full' : 'w-14 justify-center'}
            `}
            >
              <span className='text-2xl'>{item.icon}</span>
              <p
                className={`text-base transition-all duration-300 ease-in-out ${
                  showTitles ? 'opacity-100 max-w-full visible' : 'opacity-0 max-w-0 invisible absolute'
                }`}
              >
                {item.title}
              </p>
            </Link>
          ))}
        </div>

        <div
          className={`py-6 transition-all duration-300 ease-in-out ${
            showTitles ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <button
            className={`w-full rounded-[25px] py-3 bg-[#1e88e5] text-white hover:bg-[#1565c0] text-sm ${
              showTitles ? 'block' : 'hidden'
            }`}
          >
            Post
          </button>
        </div>

        <div
          className={`flex items-center space-x-3 px-3 py-2 rounded-full  transition-all duration-300 border border-transparent ${
            showTitles ? 'w-full' : 'w-14 justify-center'
          }`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={profile?.avatar} alt={profile?.username || 'User'} />
                <AvatarFallback className='bg-blue-100 text-blue-500'>
                  {profile?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='mt-2 translate-x-2 rounded-xl bg-gray-800 shadow-xl'>
              <DropdownMenuLabel className='font-bold text-white'>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className='border-gray-600' />

              {isAuthenticated ? (
                <>
                  <DropdownMenuItem className='cursor-pointer hover:bg-gray-700 text-white px-3 py-2 rounded-md'>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleChat}
                  className='cursor-pointer hover:bg-gray-700 text-white px-3 py-2 rounded-md'>
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className='cursor-pointer hover:bg-red-600 text-white px-3 py-2 rounded-md'
                  >
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={handleLogin}
                  className='cursor-pointer hover:bg-green-600 text-white px-3 py-2 rounded-md'
                >
                  Login
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          className='absolute bottom-6 left-6  bg-blue-500 text-white px-3 py-2 rounded-full'
          onClick={toggleTitlesVisibility}
        >
          {showTitles ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

export default Navigation
