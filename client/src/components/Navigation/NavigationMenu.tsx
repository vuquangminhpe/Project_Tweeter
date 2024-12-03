import { IoMdHome } from 'react-icons/io'
import { FaSearch } from 'react-icons/fa'
import { IoMdNotifications } from 'react-icons/io'
import { CiMail } from 'react-icons/ci'
import { MdPerson } from 'react-icons/md'
import { CiCircleMore } from 'react-icons/ci'
import path from '@/constants/path'

const NavigationMenu = [
  {
    title: 'Home',
    icon: <IoMdHome />,
    path: path.home
  },
  {
    title: 'Explore',
    icon: <FaSearch />,
    path: '/explore'
  },
  {
    title: 'Notifications',
    icon: <IoMdNotifications />,
    path: '/notification'
  },
  {
    title: 'Messages',
    icon: <CiMail />,
    path: '/messages'
  },
  {
    title: 'Profile',
    icon: <MdPerson />,
    path: path.profile
  },
  {
    title: 'More',
    icon: <CiCircleMore />,
    path: '/more'
  }
]

export default NavigationMenu
