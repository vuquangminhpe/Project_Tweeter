import { Server, Socket } from 'socket.io'
import Conversations from '../models/schemas/conversations.schema'
import { ObjectId } from 'mongodb'
import databaseService from '../services/database.services'
import { Server as ServerHttp } from 'http'
import { ActionType, NotificationStatus } from '../constants/enums'
import { Notification } from '../models/schemas/Notification.shema'

interface UserStatus {
  socket_id: string
  is_online: boolean
  last_active: Date
  timeoutId?: NodeJS.Timeout
  heartbeatTimeout?: NodeJS.Timeout
}

interface UserStatusResponse {
  user_id: string
  is_online: boolean
  last_active: Date
}

const HEARTBEAT_INTERVAL = 30000
const CLEANUP_TIMEOUT = 3600000

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3002'
    }
  })

  const users: {
    [key: string]: UserStatus
  } = {}

  const updateUserStatus = async (
    user_id: string,
    status: { is_online: boolean; last_active: Date },
    broadcast: boolean = true
  ) => {
    try {
      await databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            is_online: status.is_online,
            last_active: status.last_active
          }
        }
      )

      if (broadcast) {
        const statusResponse: UserStatusResponse = {
          user_id,
          is_online: status.is_online,
          last_active: status.last_active
        }
        io.emit('user_status_change', statusResponse)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const setupHeartbeat = (socket: Socket, user_id: string) => {
    if (users[user_id]?.heartbeatTimeout) {
      clearTimeout(users[user_id].heartbeatTimeout)
    }

    users[user_id].heartbeatTimeout = setInterval(async () => {
      if (!socket.connected) {
        await handleDisconnect(socket, user_id)
      }
    }, HEARTBEAT_INTERVAL)
  }

  const handleDisconnect = async (socket: Socket, user_id: string) => {
    console.log(`User ${user_id} disconnected from socket ${socket.id}`)

    if (users[user_id]) {
      if (users[user_id].heartbeatTimeout) {
        clearInterval(users[user_id].heartbeatTimeout)
      }
      if (users[user_id].timeoutId) {
        clearTimeout(users[user_id].timeoutId)
      }

      users[user_id].is_online = false
      users[user_id].last_active = new Date()

      await updateUserStatus(user_id, {
        is_online: false,
        last_active: new Date()
      })

      users[user_id].timeoutId = setTimeout(() => {
        console.log(`Cleaning up user ${user_id} from memory`)
        delete users[user_id]
      }, CLEANUP_TIMEOUT)
    }
  }

  io.on('connection', async (socket: Socket) => {
    socket.on('authenticate', (userData: { userId: string }) => {
      if (userData && userData.userId) {
        socket.join(userData.userId)
        console.log(`User ${userData.userId} authenticated and joined room`)

        io.emit('user_status_change', {
          user_id: userData.userId,
          is_online: true,
          last_active: new Date()
        })
      }
    })

    socket.on('get_all_notifications', async (data: { userId: string; page?: number; limit?: number }, callback) => {
      try {
        const { userId } = data
        const page = data.page || 1
        const limit = data.limit || 20
        const skip = (page - 1) * limit

        if (!userId) {
          return callback({
            success: false,
            message: 'UserId is required'
          })
        }

        const notifications = await databaseService.notification
          .find({
            targetId: { $in: [userId] }
          })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .toArray()

        const notificationsForClient = notifications.map((notification) => ({
          ...notification,
          _id: notification._id.toString(),
          userId: notification.userId.toString(),
          senderId: notification.senderId.toString()
        }))

        const totalCount = await databaseService.notification.countDocuments({ targetId: { $in: [userId] } })

        callback({
          success: true,
          data: {
            notifications: notificationsForClient,
            pagination: {
              total: totalCount,
              page,
              limit,
              totalPages: Math.ceil(totalCount / limit)
            }
          }
        })

        await databaseService.notification.updateMany(
          { userId: new ObjectId(userId), status: NotificationStatus.Unread },
          { $set: { status: NotificationStatus.Read } }
        )
      } catch (error: any) {
        console.error('Error getting notifications:', error)
        callback({
          success: false,
          message: 'Failed to get notifications',
          error: error.message
        })
      }
    })

    socket.on('get_notification_count', async (data: { userId: string }, callback) => {
      try {
        const { userId } = data

        if (!userId) {
          return callback({
            success: false,
            message: 'UserId is required'
          })
        }

        const count = await databaseService.notification.countDocuments({
          targetId: { $in: [userId] },
          status: NotificationStatus.Unread
        })

        callback({
          success: true,
          count
        })
      } catch (error: any) {
        console.error('Error getting notification count:', error)
        callback({
          success: false,
          message: 'Failed to get notification count',
          error: error.message
        })
      }
    })

    socket.on('mark_notifications_read', async (data: { userId: string; notificationIds?: string[] }, callback) => {
      try {
        const { userId, notificationIds } = data

        if (!userId) {
          return callback({
            success: false,
            message: 'UserId is required'
          })
        }

        let query: any = { userId: userId, status: NotificationStatus.Unread }

        if (notificationIds && notificationIds.length > 0) {
          query._id = { $in: notificationIds.map((id) => new ObjectId(id)) }
        }

        const updateResult = await databaseService.notification.updateMany(query, {
          $set: { status: NotificationStatus.Read }
        })

        const unreadCount = await databaseService.notification.countDocuments({
          userId: new ObjectId(userId),
          status: NotificationStatus.Unread
        })

        io.to(userId).emit('notification_count_updated', { count: unreadCount })

        callback({
          success: true,
          message: 'Notifications marked as read',
          modifiedCount: updateResult.modifiedCount,
          unreadCount
        })
      } catch (error: any) {
        console.error('Error marking notifications as read:', error)
        callback({
          success: false,
          message: 'Failed to mark notifications as read',
          error: error.message
        })
      }
    })

    socket.on(
      'create_notification',
      async (
        notificationData: {
          userId: string
          senderId: string
          actionType: ActionType
          targetId: string[]
          content: string
        },
        callback
      ) => {
        try {
          const { userId, senderId, actionType, targetId, content } = notificationData

          const notification = new Notification({
            userId: new ObjectId(userId),
            senderId: new ObjectId(senderId),
            actionType,
            targetId: targetId,
            content,
            timestamp: new Date(),
            status: NotificationStatus.Unread
          })

          await databaseService.notification.insertOne(notification)

          const sender = await databaseService.users.findOne(
            { _id: new ObjectId(senderId) },
            { projection: { name: 1, username: 1, avatar: 1 } }
          )

          const senderForClient = sender
            ? {
                ...sender,
                _id: sender._id.toString()
              }
            : null

          const notificationForClient = {
            _id: notification?._id?.toString() ?? '',
            userId: notification.userId.toString(),
            senderId: notification.senderId.toString(),
            actionType: notification.actionType,
            targetId: notification.targetId,
            content: notification.content,
            timestamp: notification.timestamp,
            status: notification.status,
            sender: senderForClient
          }

          for (const targetUserId of targetId) {
            io.to(targetUserId).emit('new_notification', notificationForClient)

            const unreadCount = await databaseService.notification.countDocuments({
              targetId: { $in: [targetUserId] },
              status: NotificationStatus.Unread
            })

            io.to(targetUserId).emit('notification_count_updated', { count: unreadCount })
          }

          callback({
            success: true,
            data: notificationForClient
          })
        } catch (error: any) {
          console.error('Error creating notification:', error)
          callback({
            success: false,
            message: 'Failed to create notification',
            error: error.message
          })
        }
      }
    )

    const user_id = socket.handshake.auth._id

    if (!user_id) {
      console.log('User ID not provided, continuing without user association')
    } else {
      console.log(`User ${user_id} connected with socket ${socket.id}`)

      if (users[user_id]) {
        if (users[user_id].timeoutId) clearTimeout(users[user_id].timeoutId)
        if (users[user_id].heartbeatTimeout) clearInterval(users[user_id].heartbeatTimeout)
      }

      users[user_id] = {
        socket_id: socket.id,
        is_online: true,
        last_active: new Date()
      }

      setupHeartbeat(socket, user_id)

      await updateUserStatus(user_id, {
        is_online: true,
        last_active: new Date()
      })
    }

    socket.on('send_conversation', async (data) => {
      try {
        const { sender_id, receive_id, content } = data.payload
        const receiver_socket_id = users[receive_id]?.socket_id

        const conversations = new Conversations({
          sender_id: new ObjectId(sender_id as string),
          receive_id: new ObjectId(receive_id as string),
          content: content
        })
        const result = await databaseService.conversations.insertOne(conversations)

        const conversationForClient = {
          _id: result.insertedId.toString(),
          sender_id: sender_id.toString(),
          receive_id: receive_id.toString(),
          content: content,
          created_at: conversations.created_at,
          updated_at: conversations.updated_at
        }

        if (receiver_socket_id) {
          socket.to(receiver_socket_id).emit('receive_conversation', {
            payload: conversationForClient
          })
        }
      } catch (error) {
        console.error('Error sending conversation:', error)
      }
    })

    socket.on('get_user_status', async (target_user_id: string) => {
      if (!target_user_id) return

      try {
        const result = await databaseService.users.findOne({ _id: new ObjectId(target_user_id) })
        const memoryStatus = users[target_user_id]

        const user_status: UserStatusResponse = {
          user_id: target_user_id,
          is_online: memoryStatus?.is_online || false,
          last_active: memoryStatus?.last_active || result?.last_active || new Date()
        }

        socket.emit('user_status_response', user_status)
      } catch (error) {
        console.error('Error fetching user status:', error)
        socket.emit('user_status_response', {
          user_id: target_user_id,
          is_online: false,
          last_active: new Date()
        })
      }
    })

    socket.on('get_all_online_users', () => {
      const online_users: Record<string, UserStatusResponse> = {}

      Object.entries(users).forEach(([id, status]) => {
        online_users[id] = {
          user_id: id,
          is_online: status.is_online,
          last_active: status.last_active
        }
      })

      socket.emit('all_online_users_response', online_users)
    })

    socket.on('disconnect', () => {
      if (user_id) {
        handleDisconnect(socket, user_id)
      }
    })
  })

  return io
}

export default initSocket
