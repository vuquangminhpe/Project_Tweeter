import ModeToggle from '@/components/ModeToogle'
import React from 'react'
interface Props {
  children: React.ReactNode
}
export default function RegisterLayout({ children }: Props) {
  return (
    <div className='flex flex-col'>
      <ModeToggle /> {children}
    </div>
  )
}
