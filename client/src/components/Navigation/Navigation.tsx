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
import { Image } from 'lucide-react'
import { SideBarLink } from './SideBarLink'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'

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
    <div className='hidden sm:flex flex-col items-center xl:items-start xl:w-[340px] p-2 fixed h-full'>
      <div className='flex items-center justify-center w-14 h-14 hoverAnimation p-0 xm:ml-24'>
        <Image href='' width={30} height={30} />
      </div>
      <div className='space-y-2.5 mt-4 mb-2.5 xl:ml-24'>
        {NavigationMenu.map((item, index) => (
          <SideBarLink key={index} text={item.title} Icon={item.icon} active={true} />
        ))}
      </div>
      <button className='hidden xl:inline ml-auto bg-[#1d9bf0] text-white rounded-full w-56 h-[52px] text-lg font-bold shadow-md hover:bg-[#1a8cd8]'>
        Tweet
      </button>
      <div className='text-[#d9d9d9] flex items-center justify-center hoverAnimation xl:ml-auto mt-auto'>
        <img
          src='https://yt3.ggpht.com/yti/ANjgQV_PS6nh-jE1ckvLMMhwg-P2yP8rzh7X3zLOavPLADaEGdI=s88-c-k-c0x00ffffff-no-rj'
          alt=''
          className='h-10 w-10 rounded-full xl:mr-2.5'
        />
        <div className='hidden xl:inline leading-5'>
          <h4 className='font-bold'>SonPham</h4>
          <p className='text-[#6e767d]'>2k3sonpham@gmail.com</p>
        </div>
        <DotsHorizontalIcon className='h-5 hidden xl:inline ml-10'/>
      </div>
    </div>
  )
}

export default Navigation
