import { BiHomeAlt, BiUser, BiMessageSquareDetail, BiCompass, BiBookmark, BiCog } from 'react-icons/bi'
import { HiOutlineBell, HiOutlineChartBar } from 'react-icons/hi'

const NavigationMenu = [
  { title: 'Home', icon: <BiHomeAlt />, path: '/' },
  { title: 'Explore', icon: <BiCompass />, path: '/explore' },
  { title: 'Notifications', icon: <HiOutlineBell />, path: '/notifications' },
  { title: 'Messages', icon: <BiMessageSquareDetail />, path: '/user/chat' },
  { title: 'Bookmarks', icon: <BiBookmark />, path: '/user/bookmarks' },
  { title: 'Analytics', icon: <HiOutlineChartBar />, path: '/analytics' },
  { title: 'Profile', icon: <BiUser />, path: '/profile' },
  { title: 'Settings', icon: <BiCog />, path: '/settings' }
]

export default NavigationMenu
