/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useContext, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import apiUser from '@/apis/users.api'
import path from '@/constants/path'

export default function Login() {
  const [params] = useSearchParams()
  const [data, setData] = useState([{ email: '', password: '', remember: false }])
  const [focused, setFocused] = useState({
    email: false,
    password: false
  })
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

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

  const googleOAuthUrl = getGoogleAuthUrl()

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
          const { access_token } = res
          localStorage.setItem('access_token', access_token)
          navigate('/')
        })
        .catch((error) => {
          toast.error(error.message)
        })
    }
  }, [params, navigate])

  const loginUserMutation = useMutation({
    mutationFn: (body: { email: string; password: string }) => apiUser.loginUser(body)
  })

  const handleDataChange = (field: any) => (e: any) => {
    const value = field === 'remember' ? e.target.checked : e.target.value
    setData([
      {
        ...data[0],
        [field]: value
      }
    ])
    // Reset error message when user changes input
    setErrorMessage('')
  }

  const handleFocus = (field: any) => () => {
    setFocused({
      ...focused,
      [field]: true
    })
  }

  const handleBlur = (field: 'email' | 'password' | 'remember') => () => {
    if (!data[0][field]) {
      setFocused({
        ...focused,
        [field]: false
      })
    }
  }

  const handleLogin = () => {
    setErrorMessage('')
    loginUserMutation.mutate(
      { email: data[0].email, password: data[0].password },
      {
        onSuccess: (res) => {
          const { access_token } = res.data.result
          localStorage.setItem('access_token', access_token as string)
          setTimeout(() => {
            window.location.href = '/'
          }, 0)
        },
        onError: (error) => {
          setErrorMessage((error as any).data.messages || 'Login failed')
        }
      }
    )
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password')
  }

  return (
    <div className='min-h-screen w-full flex-col bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-4'>
      <div className='text-[140px] text-center font-bold'>Flow Friend</div>
      <div className='relative w-full max-w-xl overflow-hidden rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl'>
        <div className='absolute -top-20 -left-20 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl'></div>
        <div className='absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl'></div>

        <h1 className='text-3xl text-white font-light mb-2 text-center pt-8'>LOGIN</h1>
        <p className='text-white/50 text-center text-sm mb-8'>Sign in to access your account</p>

        {/* Display error message */}
        {errorMessage && (
          <div className='mx-8 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md'>
            <p className='text-red-500 text-sm text-center'>{errorMessage}</p>
          </div>
        )}

        <div className='space-y-6 p-8 relative z-10'>
          <div className='relative'>
            <label
              className={`absolute transition-all duration-300 ${
                focused.email || data[0].email ? 'text-xs text-blue-400 top-1' : 'text-white/70 top-3'
              } left-4 pointer-events-none`}
            >
              Email
            </label>
            <input
              value={data[0].email}
              onChange={handleDataChange('email')}
              onFocus={handleFocus('email')}
              onBlur={handleBlur('email')}
              type='email'
              name='email'
              className='w-full px-4 pt-6 pb-2 rounded-md bg-white/10 backdrop-blur-sm 
                border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                text-white'
            />
          </div>

          <div className='relative'>
            <label
              className={`absolute transition-all duration-300 ${
                focused.password || data[0].password ? 'text-xs text-blue-400 top-1' : 'text-white/70 top-3'
              } left-4 pointer-events-none`}
            >
              Password
            </label>
            <input
              value={data[0].password}
              onChange={handleDataChange('password')}
              onFocus={handleFocus('password')}
              onBlur={handleBlur('password')}
              type='password'
              className='w-full px-4 pt-6 pb-2 rounded-md bg-white/10 backdrop-blur-sm 
                border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                text-white'
            />
          </div>

          <div className='flex items-center justify-between'>
            <label className='flex items-center space-x-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={data[0].remember}
                onChange={handleDataChange('remember')}
                className='w-4 h-4 rounded bg-white/10 border-white/30 text-blue-500 focus:ring-blue-500/50'
              />
              <span className='text-sm text-white/70'>Remember me</span>
            </label>

            <button onClick={handleForgotPassword} className='text-sm text-blue-400 hover:text-blue-300'>
              Forgot password?
            </button>
          </div>
        </div>

        <div className='px-8 pb-8'>
          <button
            onClick={handleLogin}
            className='w-full px-6 py-3 bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm
              text-white rounded-md transition-colors duration-200 border border-blue-500/30 mb-4'
          >
            Login
          </button>

          <button
            onClick={() => (window.location.href = googleOAuthUrl)}
            className='w-full px-6 py-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm
              text-white rounded-md transition-colors duration-200 border border-white/30 flex items-center justify-center'
          >
            <svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z'
              />
            </svg>
            Login with Google
          </button>

          <div className='mt-6 text-center text-white/50 text-sm'>
            Don't have an account?{' '}
            <Link to={path.register} className='text-blue-400 hover:text-blue-300 font-medium'>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
