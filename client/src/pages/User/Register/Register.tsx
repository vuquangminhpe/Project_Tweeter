/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import './Register.css'
import { useMutation } from '@tanstack/react-query'
import apiUser from '@/apis/user.api'
import { RegisterType } from '@/types/User.type'

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
  }
  const handleDataChange = (field: string) => (e: any) => {
    setData((prev) => [
      {
        ...prev[0],
        [field]: e.target.value
      }
    ])
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
      onSuccess: (res) => {
        console.log(res)
      },
      onError: (error) => {
        console.log(error)
      }
    })
  }
  console.log(date)

  return (
    <div className='min-h-screen w-full flex-col bg-gradient-to-br from-black to-black-400 flex items-center justify-center p-4'>
      <div className='glass'>
        <h1 className='text-2xl text-white font-light mb-6 text-center pt-4'>REGISTER</h1>

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
          <input
            onChange={handleDataChange('confirm_password')}
            type='text'
            placeholder='Confirm_Password'
            className='w-full px-4 py-2 rounded-s-md bg-white/10 backdrop-blur-sm 
          border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50
          text-white placeholder-white/70'
          />
          <input
            onChange={handleDataChange('name')}
            type='text'
            name='name'
            placeholder='Name (No required)'
            className='w-full px-4 py-2 rounded-s-md bg-white/10 backdrop-blur-sm 
          border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50
          text-white placeholder-white/70'
          />
          <div className='flex gap-3'>
            <input
              onChange={handleDateChange('year')}
              type='text'
              min={1}
              max={Number(new Date().getFullYear())}
              placeholder='year'
              className='w-full px-4 py-2 rounded-s-md bg-white/10 backdrop-blur-sm 
          border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50
          text-white placeholder-white/70'
            />
            <input
              onChange={handleDateChange('month')}
              type='text'
              min={1}
              max={12}
              placeholder='month'
              className='w-full px-4 py-2 rounded-s-md bg-white/10 backdrop-blur-sm 
        border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50
        text-white placeholder-white/70'
            />
            <input
              onChange={handleDateChange('day')}
              type='text'
              min={1}
              max={32}
              placeholder='day'
              className='w-full px-4 py-2 rounded-s-md bg-white/10 backdrop-blur-sm 
      border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50
      text-white placeholder-white/70'
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleRegister}
        className='w-[25%] mt-6 px-4 py-2  
        bg-gradient-to-r from-black to-purple-50 
        text-white font-medium hover:opacity-50 
        transition-opacity'
      >
        REGISTER
      </button>
    </div>
  )
}
