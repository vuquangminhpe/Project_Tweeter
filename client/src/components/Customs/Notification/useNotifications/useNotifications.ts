/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionType,
  NotificationData,
  NotificationStatus,
  PaginationData,
  UseNotificationsProps
} from '@/types/Notifications.types'
import socket from '@/utils/socket'
import { useEffect, useState, useCallback } from 'react'

export const useNotifications = ({ userId, limit = 10 }: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit,
    totalPages: 0
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  console.log(unreadCount)

  const connectSocket = useCallback(() => {
    if (!userId) return

    socket.connect()
    socket.emit('authenticate', { userId })

    const handleCountUpdate = (data: { count: number }) => {
      setUnreadCount(data.count)
    }

    const handleNewNotification = (notification: NotificationData) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      setPagination((prev) => ({
        ...prev,
        total: prev.total + 1
      }))
    }

    socket.on('notification_count_updated', handleCountUpdate)
    socket.on('new_notification', handleNewNotification)

    socket.emit('get_notification_count', { userId }, (response: any) => {
      if (response.success) {
        setUnreadCount(response.count)
      }
    })

    fetchNotifications(1)

    return () => {
      socket.off('notification_count_updated', handleCountUpdate)
      socket.off('new_notification', handleNewNotification)
    }
  }, [userId])

  useEffect(() => {
    connectSocket()

    return () => {}
  }, [userId, connectSocket])

  const fetchNotifications = useCallback(
    (page: number = 1) => {
      if (!userId || !socket) return

      setLoading(true)
      socket.emit('get_all_notifications', { userId, page, limit }, (response: any) => {
        if (response.success) {
          if (page === 1) {
            setNotifications(response.data.notifications)
          } else {
            setNotifications((prev) => [...prev, ...response.data.notifications])
          }

          setPagination(response.data.pagination)
        } else {
          setError(response.message || 'Failed to load notifications')
        }
        setLoading(false)
      })
    },
    [userId, limit]
  )

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchNotifications(pagination.page + 1)
    }
  }, [pagination, fetchNotifications])

  const markAsRead = useCallback(
    (notificationIds?: string[]) => {
      if (!userId || !socket) return

      socket.emit('mark_notifications_read', { userId, notificationIds }, (response: any) => {
        if (response.success) {
          setNotifications((prev) =>
            prev.map((notification) => {
              if (!notificationIds || notificationIds.includes(notification._id)) {
                return { ...notification, status: NotificationStatus.Read }
              }
              return notification
            })
          )

          setUnreadCount(response.unreadCount)
        }
      })
    },
    [userId]
  )

  const createNotification = useCallback(
    (data: { recipientId: string; actionType: ActionType; targetId: string[]; content: string }) => {
      if (!userId || !socket) return

      socket.emit(
        'create_notification',
        {
          userId: data.recipientId,
          senderId: userId,
          actionType: data.actionType,
          targetId: data.targetId,
          content: data.content
        },
        (response: any) => {
          console.log('Notification created:', response)
        }
      )
    },
    [userId]
  )

  const groupedNotifications = useCallback(() => {
    const groups: Record<string, NotificationData[]> = {}

    notifications.forEach((notification) => {
      const date = new Date(notification.timestamp).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(notification)
    })

    return groups
  }, [notifications])

  return {
    notifications,
    groupedNotifications: groupedNotifications(),
    unreadCount,
    loading,
    error,
    pagination,
    loadMore,
    markAsRead,
    refreshNotifications: () => fetchNotifications(1),
    createNotification,
    connectSocket
  }
}

export default useNotifications
