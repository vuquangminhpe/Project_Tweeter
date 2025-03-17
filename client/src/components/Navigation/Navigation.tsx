import { useState, useEffect, useContext } from 'react'
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
import { toast } from 'sonner'
import { AppContext } from '@/Contexts/app.context'

const Navigation = () => {
  const [showTitles, setShowTitles] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeItem, setActiveItem] = useState('/')
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthStatus()
    const handleStorageChange = () => checkAuthStatus()
    document.addEventListener('clearLocalStorage', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)
    return () => {
      document.removeEventListener('clearLocalStorage', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    setActiveItem(window.location.pathname)
  }, [window.location.pathname])

  const checkAuthStatus = () => {
    const hasToken = localStorage.getItem('access_token') !== null
    const hasProfile = localStorage.getItem('profile') !== null
    setIsAuthenticated(hasToken && hasProfile)
  }

  useEffect(() => {
    checkAuthStatus()
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
      toast.success('Logged out successfully')
      setTimeout(() => {
        window.location.href = '/'
      }, 300)
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  const handleLogin = () => {
    navigate('/auth/login')
  }

  const { profile } = useContext(AppContext)

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 ${showTitles ? 'w-full' : 'w-16'}`}>
      <div className='py-6 flex items-center justify-center'>
        <div className='bg-gradient-to-r from-violet-600 to-indigo-700 p-2 rounded-lg'>
          <svg fill='white' height='24' width='24' viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6h10v2H7zm0-4h10v2H7z' />
          </svg>
        </div>
        {showTitles && (
          <span className='ml-3 text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-700 text-transparent bg-clip-text'>
            Flow Friend
          </span>
        )}
      </div>

      <div className='flex-1 space-y-1 px-2 py-4'>
        {NavigationMenu.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className={`
              flex items-center px-3 py-3 rounded-lg transition-all duration-200
              ${
                activeItem === item.path
                  ? 'bg-gradient-to-r from-violet-100 to-indigo-100 text-indigo-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }
              ${showTitles ? 'justify-start' : 'justify-center'}
            `}
            onClick={() => setActiveItem(item.path)}
          >
            <span className={`text-xl ${activeItem === item.path ? 'text-indigo-600' : ''}`}>{item.icon}</span>
            {showTitles && <span className='ml-3 text-sm font-medium'>{item.title}</span>}
          </Link>
        ))}
      </div>

      {/* Create Post Button */}
      {showTitles && (
        <div className='px-4 mb-6'>
          <button className='w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg py-3 font-medium hover:from-violet-700 hover:to-indigo-700 transition-colors shadow-sm'>
            Create Post
          </button>
        </div>
      )}

      <div className='px-4 py-4 border-t border-gray-200'>
        <DropdownMenu>
          <DropdownMenuTrigger className='w-full'>
            <div className={`flex items-center ${showTitles ? 'justify-between' : 'justify-center'}`}>
              <div className='flex items-center'>
                <Avatar className='border-2 border-violet-100'>
                  <AvatarImage src={profile?.avatar} alt={profile?.username || 'User'} />
                  <AvatarFallback className='bg-gradient-to-r from-violet-200 to-indigo-200 text-indigo-600'>
                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                {showTitles && (
                  <div className='ml-3'>
                    <p className='text-sm font-medium'>{profile?.name || 'User'}</p>
                    <p className='text-xs text-gray-500'>@{profile?.username || 'username'}</p>
                  </div>
                )}
              </div>

              {showTitles && (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-gray-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className='w-56 mt-2 rounded-lg border border-gray-200 shadow-lg bg-white'>
            <DropdownMenuLabel className='font-bold'>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {isAuthenticated ? (
              <>
                <DropdownMenuItem className='cursor-pointer hover:bg-violet-50 text-gray-700 px-3 py-2 rounded-md'>
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer hover:bg-violet-50 text-gray-700 px-3 py-2 rounded-md'>
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className='cursor-pointer hover:bg-red-50 text-red-600 px-3 py-2 rounded-md'
                >
                  Sign Out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={handleLogin}
                className='cursor-pointer hover:bg-violet-50 text-indigo-600 px-3 py-2 rounded-md'
              >
                Sign In
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button
        className='absolute bottom-6 left-4 bg-white border border-gray-200 text-indigo-600 p-2 rounded-lg shadow-sm hover:bg-violet-50'
        onClick={toggleTitlesVisibility}
      >
        {showTitles ? (
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
        ) : (
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
              clipRule='evenodd'
            />
          </svg>
        )}
      </button>
    </div>
  )
}

export default Navigation
