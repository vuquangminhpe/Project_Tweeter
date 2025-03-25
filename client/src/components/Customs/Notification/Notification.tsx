/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import useMeasure from 'react-use-measure'
import { NotificationData, NotificationStatus } from '@/types/Notifications.types'
import * as Icons from 'lucide-react'
import useNotifications from './useNotifications/useNotifications'

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
  const [showNotification, setShowNotification] = useState(true)

  const [ref, { height: viewHeight }] = useMeasure()

  const { notifications, unreadCount, loading, markAsRead, refreshNotifications } = useNotifications({
    userId,
    limit: 10
  })

  const groupedNotifications = (() => {
    const groups: Record<string, NotificationData[]> = {}

    notifications.forEach((notification) => {
      const date = new Date(notification.timestamp).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(notification)
    })

    return groups
  })()

  useEffect(() => {
    if (notifications.length > 0) {
      const newestUnreadNotification = notifications.find((n) => n.status === NotificationStatus.Unread)

      if (newestUnreadNotification) {
        setCurrentNotification(newestUnreadNotification)
      } else {
        setCurrentNotification(notifications[0])
      }
    }
  }, [notifications])

  const handleOpenSettings = () => {
    setIsOpen((prev) => !prev)

    if (!isOpen) {
      refreshNotifications()
    }
  }

  const closeNotification = () => {
    setIsOpen(false)

    if (currentNotification && currentNotification.status === NotificationStatus.Unread) {
      markAsRead([currentNotification._id])
    }
  }

  const notificationMessage = currentNotification
    ? currentNotification.content || 'New notification'
    : 'No notifications'

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'TWEET':
        return 'Twitter'
      case 'LIKE':
        return 'Heart'
      case 'COMMENT':
        return 'MessageSquare'
      case 'SHARE':
        return 'Share2'
      case 'MENTION':
        return 'AtSign'
      case 'FOLLOW':
        return 'UserPlus'
      default:
        return 'Bell'
    }
  }

  const iconComponentName = currentNotification ? getActionTypeIcon(currentNotification.actionType) : 'Bell'

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
            'absolute z-50 top-5 right-1 overflow-hidden rounded-2xl dark:bg-neutral-900 bg-neutral-50 border border-neutral-400/15 text-neutral-50 shadow-lg transition',
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
                initial={{ opacity: 0.6 }}
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
                <div className='flex items-center justify-between px-2'>
                  <h6 className='text-sm font-medium dark:text-neutral-200 text-neutral-700'>Notifications</h6>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAsRead()}
                      className='text-xs text-amber-500 hover:text-amber-600 dark:hover:text-amber-400'
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className='flex justify-center p-4'>
                    <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-amber-500'></div>
                  </div>
                ) : (
                  <>
                    {notifications.length > 0 ? (
                      <div className='flex flex-col gap-2 max-h-80 overflow-y-auto'>
                        {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                          <div key={date} className='flex flex-col gap-1.5'>
                            <div className='px-2 py-1'>
                              <span className='text-xs font-medium dark:text-neutral-400 text-neutral-500'>{date}</span>
                            </div>

                            {dateNotifications.map((notification) => {
                              const isRead = notification.status === NotificationStatus.Read
                              const message = notification.content || 'New notification'

                              const notifIconComponentName = getActionTypeIcon(notification.actionType)
                              const NotifIcon = getIconComponent(notifIconComponentName)

                              return (
                                <div
                                  key={notification._id}
                                  className={cn(
                                    'p-2 rounded-lg',
                                    isRead
                                      ? 'opacity-60 dark:bg-neutral-800/50 bg-neutral-100/50'
                                      : 'dark:bg-neutral-800 bg-neutral-100'
                                  )}
                                >
                                  <div className='flex items-start gap-2'>
                                    <div
                                      className={cn(
                                        'p-1.5 rounded-full',
                                        isRead ? 'dark:bg-neutral-700 bg-neutral-200' : 'bg-amber-500/20'
                                      )}
                                    >
                                      <NotifIcon
                                        className={cn(
                                          'size-4',
                                          isRead ? 'dark:text-neutral-400 text-neutral-500' : 'text-amber-500'
                                        )}
                                      />
                                    </div>
                                    <div className='flex-1'>
                                      <h6
                                        className={cn(
                                          'text-xs font-medium',
                                          isRead
                                            ? 'dark:text-neutral-400 text-neutral-600'
                                            : 'dark:text-neutral-200 text-neutral-700'
                                        )}
                                      >
                                        {notification.actionType}
                                      </h6>
                                      <p
                                        className={cn(
                                          'text-sm leading-5',
                                          isRead
                                            ? 'dark:text-neutral-500 text-neutral-500'
                                            : 'dark:text-neutral-300 text-neutral-600'
                                        )}
                                      >
                                        {message}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='p-4 text-center'>
                        <p className='text-neutral-600 dark:text-neutral-400'>No notifications yet</p>
                      </div>
                    )}
                  </>
                )}
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
