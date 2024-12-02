/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const OAuthCallback = () => {
  const url = useLocation()

  const navigate = useNavigate()

  useEffect(() => {
    const code = 1
    if (code) {
      const params = new URLSearchParams(url.search)

      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      localStorage.setItem('access_token', access_token as string)
      localStorage.setItem('refresh_token', refresh_token as string)
      navigate('/home')
    }
  }, [url, navigate])

  return <div>Login with Google</div>
}

export default OAuthCallback
