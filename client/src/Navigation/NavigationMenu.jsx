import React from 'react'
import { IoMdHome } from 'react-icons/io'
import { FaSearch, FaListAlt, FaUsers } from 'react-icons/fa'
import { IoMdNotifications } from 'react-icons/io'
import { CiMail } from 'react-icons/ci'
import { MdPerson } from 'react-icons/md'
import { CiCircleMore } from 'react-icons/ci'

const NavigationMenu = [
  {
    title: 'Home',
    icon: <IoMdHome />,
    path: '/home'
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
    title: 'Grok',
    icon: <FaListAlt />,
    path: '/grok'
  },
  {
    title: 'Communities',
    icon: <FaUsers />,
    path: '/communities'
  },
  {
    title: 'Profile',
    icon: <MdPerson />,
    path: '/profile'
  },
  {
    title: 'More',
    icon: <CiCircleMore />,
    path: '/more'
  }
]

export default NavigationMenu
