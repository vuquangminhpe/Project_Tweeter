/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import useMeasure from 'react-use-measure'
import { NotificationData, NotificationStatus } from '@/types/Notifications.types'
import * as Icons from 'lucide-react'
import useNotifications from './useNotifications/useNotifications'
import { formatNotificationMessage, getNotificationIcon } from './FormatterNotifications/formatNotificationMessage'

// Helper to get icon from string name
const getIconComponent = (name: string) => {
  const Icon = (Icons as unknown as Record<string, React.FC<any>>)[name] || Icons.Bell
  return Icon
}

const WIDTH = 500

export default function NotificationIsland({
  userId
}: Readonly<{
  userId: string
}>) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null)
  const [showNotification, setShowNotification] = useState(false)

  const [ref, { height: viewHeight }] = useMeasure()

  const { notifications, unreadCount, markAsRead, refreshNotifications } = useNotifications({ userId, limit: 10 })
  console.log('notifications', notifications)

  useEffect(() => {
    // Show the newest notification if there's an unread one
    if (notifications.length > 0 && unreadCount > 0) {
      // Assuming NotificationStatus.Unread is the enum value we want to check against
      const newestNotification = notifications.find((n) => n.status === NotificationStatus.Unread)
      if (newestNotification) {
        setCurrentNotification(newestNotification)
        setShowNotification(true)
      }
    }
  }, [notifications, unreadCount])

  const handleOpenSettings = () => {
    setIsOpen((prev) => !prev)

    // Mark all as read when opening
    if (!isOpen && unreadCount > 0) {
      markAsRead()
    }
  }

  const closeNotification = () => {
    setShowNotification(false)
    setIsOpen(false)

    // Mark current notification as read
    if (currentNotification) {
      markAsRead([currentNotification._id])
    }
  }

  // Format the notification message
  const notificationMessage = currentNotification
    ? formatNotificationMessage(currentNotification.actionType, {
        senderName: currentNotification.sender.name,
        targetType: currentNotification.targetData?.type,
        targetName: currentNotification.targetData?.name,
        contentPreview: currentNotification.content
      })
    : ''

  // Get the notification icon
  const iconName = currentNotification ? getNotificationIcon(currentNotification.actionType) : 'bell'

  // Convert kebab-case to PascalCase for icon names
  const iconComponentName = iconName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  const NotificationIcon = getIconComponent(iconComponentName)

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          exit={{ y: -190, filter: 'blur(8px)', opacity: 0, scale: 0 }}
          animate={{
            height: isOpen ? (viewHeight ?? 0) : 52,
            width: isOpen ? WIDTH : 52
          }}
          className={cn(
            'absolute z-50 top-6 right-6 overflow-hidden rounded-2xl dark:bg-neutral-900 bg-neutral-50 border border-neutral-400/15 text-neutral-50 shadow-lg transition',
            !isOpen &&
              unreadCount > 0 &&
              'after:size-2 after:absolute after:top-3 after:right-4 after:bg-amber-500 after:rounded-full after:pointer-events-none',
            !isOpen &&
              unreadCount > 0 &&
              'before:size-3 before:absolute before:top-2.5 before:right-3.5 before:border before:border-amber-500 before:rounded-xl before:animate-ping before:pointer-events-none',
            !isOpen && 'dark:hover:bg-neutral-800 hover:bg-neutral-100'
          )}
          transition={{
            type: 'spring',
            duration: 0.6
          }}
        >
          <AnimatePresence initial={false} mode='popLayout'>
            {!isOpen && (
              <motion.button
                key='icon-button'
                className='size-full absolute top-0 right-0 inline-grid place-content-center transform-gpu dark:text-neutral-400 text-neutral-600 transition-colors duration-500 dark:hover:text-neutral-300 hover:text-neutral-700'
                onClick={handleOpenSettings}
                type='button'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <NotificationIcon className='transform-gpu transition duration-300 pointer-events-none' />
                {unreadCount > 0 && (
                  <div className='absolute top-1 right-1 min-w-4 h-4 flex items-center justify-center bg-amber-500 rounded-full text-xs font-semibold text-white px-1'>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence mode='wait'>
            {isOpen && (
              <motion.div
                key='content'
                ref={ref}
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.6, type: 'spring' }}
                className='flex flex-col gap-4 p-2'
                style={{ width: WIDTH }}
              >
                <div className='p-2'>
                  <h6 className='text tracking-tight font-medium text-sm text-neutral-400'>
                    {currentNotification?.sender?.name || 'Notification'}
                  </h6>
                  <p className='text-neutral-600 dark:text-neutral-400 leading-5'>{notificationMessage}</p>
                </div>
                <button
                  className='rounded-lg bg-amber-500 dark:bg-amber-200 px-2 py-1 font-medium dark:text-neutral-800 text-neutral-100'
                  type='button'
                  onClick={closeNotification}
                >
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
