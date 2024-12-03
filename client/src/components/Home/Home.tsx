/* eslint-disable react-hooks/exhaustive-deps */ /* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
// Base styles for media player and provider (~400B).
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import HomeSection from '@/pages/User/HomeSection'
import Navigation from '../Navigation/Navigation'
import axios from 'axios'
import RightPart from '../RightPart/RightPart'

function Home() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  const logout = () => {
    localStorage.setItem('access_token', '')
    localStorage.setItem('refresh_token', '')
  }

  const [showNavigation, setShowNavigation] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    axios
      .get('/users/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        baseURL: 'http://localhost:5000',
        signal: controller.signal
      })
      .then((res) => {
        localStorage.setItem('profile', JSON.stringify(res.data.result))
      })
      .catch((err) => {
        console.log('error', err)
      })
    return () => {
      controller.abort()
    }
  }, [localStorage.getItem('access_token')])

  return (
    <div>
      <div className='flex  w-screen px-5 lg:px-0 justify-between'>
        <div
          className={`lg:block lg:w-3/12 w-full relative transition-all duration-300 ${
            showNavigation ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <Navigation />
        </div>

        <div className='lg:w-5/12 w-full relative'>
          <HomeSection />
        </div>

        <div className='hidden lg:block lg:w-4/12 w-full relative'>
          <RightPart />
        </div>
      </div>

      <button
        className='lg:hidden fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md'
        onClick={() => setShowNavigation(!showNavigation)}
      >
        {showNavigation ? 'Hide Navigation' : 'Show Navigation'}
      </button>
    </div>
  )
}

export default Home
