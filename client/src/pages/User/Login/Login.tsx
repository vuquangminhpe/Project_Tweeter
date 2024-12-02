/* eslint-disable @typescript-eslint/no-explicit-any */
import apiUser from '@/apis/user.api'
import { AppContext } from '@/Contexts/app.context'
import { RegisterType } from '@/types/User.type'
import { useMutation } from '@tanstack/react-query'
import { useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

type LoginType = Pick<RegisterType, 'email' | 'password'>[]

export default function Login() {
  const [params] = useSearchParams()
  const { isAuthenticated } = useContext(AppContext)
  console.log(isAuthenticated)
  const [data, setData] = useState<LoginType>([{ email: '', password: '' }])
  const navigate = useNavigate()

  console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)

  const getGoogleAuthUrl = () => {
    const url = 'https://accounts.google.com/o/oauth2/auth'
    const query = {
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' '),
      prompt: 'consent',
      access_type: 'offline'
    }

    const queryString = new URLSearchParams(query).toString()
    return `${url}?${queryString}`
  }

  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code,
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      })
      return await response.json()
    } catch (error) {
      throw new Error(`Failed to exchange code for token: ${error}`)
    }
  }

  useEffect(() => {
    const code = params.get('code')
    if (code) {
      exchangeCodeForToken(code)
        .then((res) => {
          const { access_token, refresh_token } = res
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          navigate('/home')
        })
        .catch((error) => {
          toast.error(error)
        })
    }
  }, [params, navigate])

  const googleOAuthUrl = getGoogleAuthUrl()
  const loginUserMutation = useMutation({
    mutationFn: (body: LoginType) => apiUser.loginUser(body)
  })

  const handleDataChange = (field: string) => (e: any) => {
    setData((prev) => [
      {
        ...prev[0],
        [field]: e.target.value
      }
    ])
  }

  const handleLogin = () => {
    loginUserMutation.mutate(Object(data[0]), {
      onSuccess: (res) => {
        const { access_token, refresh_token } = res.data.result
        localStorage.setItem('access_token', access_token as string)
        localStorage.setItem('refresh_token', refresh_token as string)
        navigate('/home')
      },
      onError: (error: any) => {
        toast.error(`${error.data.messages}`)
      }
    })
  }

  return (
    <div className='min-h-screen w-full flex-col bg-gradient-to-br from-black to-black-400 flex items-center justify-center p-4'>
      <div className='glass'>
        <h1 className='text-2xl text-white font-light mb-6 text-center pt-4'>LOGIN</h1>
        <div className='space-y-4 p-10'>
          <input
            onChange={handleDataChange('email')}
            type='text'
            placeholder='email'
            name='email'
            className='w-full px-4 py-2 rounded-s-md bg-white/10 backdrop-blur-sm 
          border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50
          text-white placeholder-white/70'
          />

          <input
            onChange={handleDataChange('password')}
            type='text'
            placeholder='Password'
            className='w-full px-4 py-2 rounded-s-md bg-white/10 backdrop-blur-sm 
          border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50
          text-white placeholder-white/70'
          />
        </div>
      </div>
      <button onClick={handleLogin} className='w-[25%] mt-6 px-4 py-2 bg-blue-500 text-white rounded-md'>
        Login
      </button>
      <button
        onClick={() => (window.location.href = googleOAuthUrl)}
        className='w-[25%] mt-6 px-4 py-2 bg-red-500 text-white rounded-xl'
      >
        Login with Google
      </button>
    </div>
  )
}
