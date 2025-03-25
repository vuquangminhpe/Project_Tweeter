import Navigation from '@/components/Navigation/Navigation'
import React from 'react'
interface Props {
  children?: React.ReactNode
}
export default function MainLayout({ children }: Props) {
  return (
    <div className='w-full bg-black flex'>
      <div className='hidden lg:block lg:w-2/12 w-full'>
        <Navigation />
      </div>
      {children}
    </div>
  )
}
