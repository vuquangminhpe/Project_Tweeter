import { BiHomeAlt, BiUser, BiMessageSquareDetail, BiCompass, BiBookmark, BiCog } from 'react-icons/bi'
import { HiOutlineBell, HiOutlineChartBar } from 'react-icons/hi'
import { FaUserFriends } from "react-icons/fa";

const NavigationMenu = [
  { title: 'Home', icon: <BiHomeAlt />, path: '/' },
  { title: 'Explore', icon: <BiCompass />, path: '/explore' },
  { title: 'Notifications', icon: <HiOutlineBell />, path: '/notifications' },
  { title: 'Messages', icon: <BiMessageSquareDetail />, path: '/user/chat' },
  { title: 'Bookmarks', icon: <BiBookmark />, path: '/user/bookmarks' },
  { title: 'List Follow', icon: <FaUserFriends />, path: '/user/following' },
  { title: 'Story', icon: <HiOutlineChartBar />, path: '/user/story' },
  { title: 'Profile', icon: <BiUser />, path: '/profile' },
  { title: 'Settings', icon: <BiCog />, path: '/settings' }
]

export default NavigationMenu
