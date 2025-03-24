import { useEffect } from 'react'
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import Navigation from '../Navigation/Navigation'
import axios from 'axios'
import RightPart from '../RightPart/RightPart'
import Feed from '../../pages/User/HomeSection/Feed'
import HomeSection from '@/pages/User/HomeSection'

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
    <div className='bg-black flex min-h-screen max-w-[1500px] mx-auto'>
      <Navigation/>
      <HomeSection/>
      {/* <Feed/> */}
      <RightPart/>
    </div>
  )
}

export default Home
