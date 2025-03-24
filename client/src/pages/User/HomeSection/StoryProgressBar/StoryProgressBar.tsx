import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface StoryProgressBarProps {
  count: number
  activeIndex: number
  duration: number
  isPaused: boolean
  onComplete: () => void
}

const StoryProgressBar = ({ count, activeIndex, duration, isPaused, onComplete }: StoryProgressBarProps) => {
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    setProgress(0)
  }, [activeIndex])

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const interval = 50
    const increment = (100 * interval) / duration // Calculate increment per interval

    intervalRef.current = window.setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + increment

        if (newProgress >= 100) {
          clearInterval(intervalRef.current!)
          onComplete()
          return 0
        }

        return newProgress
      })
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeIndex, isPaused, duration, onComplete])

  return (
    <div className='flex w-full z-[99999] gap-1.5'>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className='h-1 rounded-full bg-white/30 flex-1 overflow-hidden'>
          {index === activeIndex ? (
            <motion.div
              className='h-full bg-white'
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              transition={{ duration: 0 }}
            />
          ) : index < activeIndex ? (
            <div className='h-full w-full bg-white' />
          ) : (
            <div className='h-full w-0 bg-white' />
          )}
        </div>
      ))}
    </div>
  )
}

export default StoryProgressBar
