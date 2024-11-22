/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect } from 'react'
// Base styles for media player and provider (~400B).
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import HomeSection from '@/pages/User/HomeSection'
import Navigation from '../Navigation/Navigation'

const getGoogleAuthUrl = () => {
  const url = 'https://accounts.google.com/o/oauth2/auth'
  const query = {
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(
      ' '
    ),
    prompt: 'consent',
    access_type: 'offline'
  }
  const queryString = new URLSearchParams(query).toString()
  return `${url}?${queryString}`
}

const googleOAuthUrl = getGoogleAuthUrl()
function Home() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  const logout = () => {
    localStorage.setItem('access_token', '')
    localStorage.setItem('refresh_token', '')
  }
  useEffect(() => {
    localStorage.getItem('access_token')
  }, [isAuthenticated])
  return (
    <div>
      <div className='flex flex-wrap w-screen px-5 lg:px-0 justify-between'>
        {/* Left Part */}
        <div className='hidden lg:block lg:w-2/12 w-full relative'>
          <Navigation />
        </div>

        {/* Middle Part */}
        <div className='lg:w-6/12 w-full relative'>
          <HomeSection />
        </div>

        {/* Right Part */}
        <div className='hidden lg:block lg:w-3/12 w-full relative'>
          <p className='text-center'>right part</p>
        </div>
      </div>
    </div>
  )
}

export default Home
