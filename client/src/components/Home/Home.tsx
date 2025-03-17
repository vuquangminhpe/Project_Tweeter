import { useEffect } from 'react'
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import HomeSection from '@/pages/User/HomeSection'
import Navigation from '../Navigation/Navigation'
import axios from 'axios'
import RightPart from '../RightPart/RightPart'

function Home() {
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
    <div className='bg-gradient-to-b from-indigo-50 to-purple-50 min-h-screen'>
      <header className='bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-lg py-3 px-6 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <h1 className='text-2xl font-extrabold tracking-tight'>Flow Friend</h1>
          <div className='flex items-center space-x-4'>
            <button className='bg-white text-violet-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-violet-100 transition-colors'>
              New Features
            </button>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row gap-6'>
          <div className='lg:w-3/12 bg-white rounded-xl shadow-sm overflow-hidden'>
            <Navigation />
          </div>

          <div className='lg:w-5/12 flex flex-col gap-6'>
            <div className='bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl p-6 text-white shadow-md'>
              <h2 className='text-xl font-bold mb-2'>Welcome to Flow Friend</h2>
              <p className='mb-4'>Share your thoughts, connect with friends, and discover what's trending today.</p>
              <button className='bg-white text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors'>
                Explore
              </button>
            </div>

            <HomeSection />
          </div>

          <div className='hidden lg:block lg:w-4/12'>
            <div className='bg-white rounded-xl shadow-sm p-4 sticky top-24'>
              <RightPart />
            </div>
          </div>
        </div>
      </div>

      <button className='lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-full shadow-lg'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
        </svg>
      </button>
    </div>
  )
}

export default Home
