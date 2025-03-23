import { useState, useEffect, useContext } from 'react'
import NavigationMenu from './NavigationMenu'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { clearLocalStorage } from '@/utils/auth'
import { toast } from 'sonner'
import { AppContext } from '@/Contexts/app.context'
import { Image } from 'lucide-react'
import { SideBarLink } from './SideBarLink'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'

const Navigation = () => {
  const [showTitles, setShowTitles] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeItem, setActiveItem] = useState('/')
  const [dropDown, setDropDown] = useState(false)
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
    <div className='hidden sm:flex flex-col items-center xl:items-start xl:w-[340px] p-2 fixed h-full'>
      <div className='flex items-center justify-center w-14 h-14 hoverAnimation p-0 xm:ml-24'>
        <Image href='' width={30} height={30} />
      </div>
      <div className='space-y-2.5 mt-4 mb-2.5 xl:ml-24'>
        {NavigationMenu.map((item, index) => (
          <SideBarLink key={index} text={item.title} Icon={item.icon} path={item.path} />
        ))}
      </div>
      <button className='hidden xl:inline ml-auto bg-[#1d9bf0] text-white rounded-full w-56 h-[52px] text-lg font-bold shadow-md hover:bg-[#1a8cd8]'>
        Post
      </button>

      <div
        className='text-[#d9d9d9] flex items-center justify-between hoverAnimation xl:ml-auto w-full mt-auto'
        onClick={() => setDropDown(!dropDown)}
      >
        <div className='flex flex-row'>
          <Avatar className='h-10 w-10 rounded-full xl:mr-2.5 xl:ml-0 ml-2'>
            <AvatarImage src={profile?.avatar} alt={profile?.username || 'User'} />
            <AvatarFallback className='bg-gradient-to-r from-violet-200 to-indigo-200 text-indigo-600'>
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className='hidden xl:inline leading-5 text-left flex-col items-start'>
            <h4 className='font-bold'>{profile?.name || 'User'}</h4>
            <p className='text-[#6e767d]'>@{profile?.username || 'username'}</p>
          </div>
        </div>
        <DotsHorizontalIcon className='h-5 hidden xl:inline ml-10' />
      </div>

      {dropDown && (
        <div className='fixed xl:bottom-14 xl:left-14 bottom-11 left-11 border border-gray-700 shadow-lg bg-gray-800 text-white w-52 rounded-lg py-2 z-50 mb-4'>
          <div className='px-3 py-2 hover:bg-gray-700 text-gray-300 font-bold'>My Account</div>
          {profile ? (
            <>
              <div
                onClick={() => console.log('View Profile')}
                className='cursor-pointer hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-md transition'
              >
                View Profile
              </div>
              <div
                onClick={() => console.log('Account Settings')}
                className='cursor-pointer hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-md transition'
              >
                Account Settings
              </div>
              <div className='border-t border-gray-600 my-2'></div>
              <div
                onClick={handleLogout}
                className='cursor-pointer hover:bg-red-700 text-red-400 px-3 py-2 rounded-md transition'
              >
                Sign Out
              </div>
            </>
          ) : (
            <div
              onClick={handleLogin}
              className='cursor-pointer hover:bg-gray-700 text-indigo-400 px-3 py-2 rounded-md transition'
            >
              Sign In
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Navigation
