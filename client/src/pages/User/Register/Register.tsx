/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import apiUser from '@/apis/users.api'
import { RegisterType } from '@/types/User.type'
import path from '@/constants/path'

export default function Register() {
  const [date, setDate] = useState([
    {
      year: 0,
      month: 0,
      day: 0
    }
  ])
  const [data, setData] = useState<RegisterType[]>([
    { email: '', password: '', confirm_password: '', name: '', date_of_birth: '' }
  ])
  const [focused, setFocused] = useState({
    email: false,
    password: false,
    confirm_password: false,
    name: false,
    year: false,
    month: false,
    day: false
  })

  const registerMutation = useMutation({
    mutationFn: (body: RegisterType[]) => apiUser.registerUser(body)
  })

  const handleDateChange = (field: string) => (e: any) => {
    setDate((prev) => [
      {
        ...prev[0],
        [field]: Number(e.target.value)
      }
    ])

    handleFocus(field)(e)
  }

  const handleDataChange = (field: string) => (e: any) => {
    setData((prev) => [
      {
        ...prev[0],
        [field]: e.target.value
      }
    ])
  }

  const handleFocus = (field: any) => (e: any) => {
    setFocused({
      ...focused,
      [field]: true
    })
  }

  const handleBlur = (field: string) => (e: any) => {
    const value =
      field === 'year' || field === 'month' || field === 'day'
        ? date[0][field as keyof (typeof date)[0]]
        : data[0][field as keyof (typeof data)[0]]

    if (!value) {
      setFocused({
        ...focused,
        [field]: false
      })
    }
  }

  useEffect(() => {
    if (date[0].year && date[0].month && date[0].day) {
      const formattedDate = `${date[0].year}-${Number(date[0].month) < 10 ? `0${date[0].month}` : date[0].month}-${Number(date[0].day) < 10 ? `0${date[0].day}` : date[0].day}`

      setData((prev) => [
        {
          ...prev[0],
          date_of_birth: formattedDate
        }
      ])
    }
  }, [date])

  const handleRegister = () => {
    registerMutation.mutate(Object(data[0]), {
      onSuccess: () => {
        toast.success('Registration successful! Please log in.')
        window.location.href = path.login
      },
      onError: (error) => {
        toast.error(`${(error as any).data?.messages || 'Registration failed. Please try again.'}`)
      }
    })
  }

  return (
    <div className='min-h-screen w-full flex-col bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-4'>
      <div className='text-[140px] text-center font-bold'>Flow Friend</div>
      <div className='relative w-full max-w-xl overflow-hidden rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl'>
        <div className='absolute -top-20 -left-20 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl'></div>
        <div className='absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl'></div>

        <h1 className='text-3xl text-white font-light mb-2 text-center pt-8'>REGISTER</h1>
        <p className='text-white/50 text-center text-sm mb-8'>Create your account</p>

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

          <div className='relative'>
            <label
              className={`absolute transition-all duration-300 ${
                focused.confirm_password || data[0].confirm_password
                  ? 'text-xs text-blue-400 top-1'
                  : 'text-white/70 top-3'
              } left-4 pointer-events-none`}
            >
              Confirm Password
            </label>
            <input
              value={data[0].confirm_password}
              onChange={handleDataChange('confirm_password')}
              onFocus={handleFocus('confirm_password')}
              onBlur={handleBlur('confirm_password')}
              type='password'
              className='w-full px-4 pt-6 pb-2 rounded-md bg-white/10 backdrop-blur-sm 
                border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                text-white'
            />
          </div>

          <div className='relative'>
            <label
              className={`absolute transition-all duration-300 ${
                focused.name || data[0].name ? 'text-xs text-blue-400 top-1' : 'text-white/70 top-3'
              } left-4 pointer-events-none`}
            >
              Name (Optional)
            </label>
            <input
              value={data[0].name}
              onChange={handleDataChange('name')}
              onFocus={handleFocus('name')}
              onBlur={handleBlur('name')}
              type='text'
              name='name'
              className='w-full px-4 pt-6 pb-2 rounded-md bg-white/10 backdrop-blur-sm 
                border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                text-white'
            />
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div className='relative'>
              <label
                className={`absolute transition-all duration-300 ${
                  focused.year || date[0].year ? 'text-xs text-blue-400 top-1' : 'text-white/70 top-3'
                } left-4 pointer-events-none`}
              >
                Year
              </label>
              <input
                value={date[0].year || ''}
                onChange={handleDateChange('year')}
                onFocus={handleFocus('year')}
                onBlur={handleBlur('year')}
                type='number'
                min={1900}
                max={new Date().getFullYear()}
                className='w-full px-4 pt-6 pb-2 rounded-md bg-white/10 backdrop-blur-sm 
                  border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  text-white'
              />
            </div>

            <div className='relative'>
              <label
                className={`absolute transition-all duration-300 ${
                  focused.month || date[0].month ? 'text-xs text-blue-400 top-1' : 'text-white/70 top-3'
                } left-4 pointer-events-none`}
              >
                Month
              </label>
              <input
                value={date[0].month || ''}
                onChange={handleDateChange('month')}
                onFocus={handleFocus('month')}
                onBlur={handleBlur('month')}
                type='number'
                min={1}
                max={12}
                className='w-full px-4 pt-6 pb-2 rounded-md bg-white/10 backdrop-blur-sm 
                  border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  text-white'
              />
            </div>

            <div className='relative'>
              <label
                className={`absolute transition-all duration-300 ${
                  focused.day || date[0].day ? 'text-xs text-blue-400 top-1' : 'text-white/70 top-3'
                } left-4 pointer-events-none`}
              >
                Day
              </label>
              <input
                value={date[0].day || ''}
                onChange={handleDateChange('day')}
                onFocus={handleFocus('day')}
                onBlur={handleBlur('day')}
                type='number'
                min={1}
                max={31}
                className='w-full px-4 pt-6 pb-2 rounded-md bg-white/10 backdrop-blur-sm 
                  border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  text-white'
              />
            </div>
          </div>
        </div>

        <div className='px-8 pb-8'>
          <button
            onClick={handleRegister}
            className='w-full px-6 py-3 bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm
              text-white rounded-md transition-colors duration-200 border border-blue-500/30 mb-4'
          >
            Register
          </button>

          <div className='mt-6 text-center text-white/50 text-sm'>
            Already have an account?{' '}
            <Link to={path.login} className='text-blue-400 hover:text-blue-300 font-medium'>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
