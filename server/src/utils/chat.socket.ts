import { Server, Socket } from 'socket.io'
import Conversations from '~/models/schemas/conversations.schema'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { Server as ServerHttp } from 'http'
import { registerNotificationHandlers } from './notifications.socket'

interface UserStatus {
  socket_id: string
  is_online: boolean
  last_active: Date
  timeoutId?: NodeJS.Timeout
  heartbeatTimeout?: NodeJS.Timeout
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
        io.emit('user_status_change', {
          user_id,
          ...status
        })
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
    registerNotificationHandlers(io, socket)
    const user_id = socket.handshake.auth._id
    // if (!user_id) {
    //   console.error('User ID not provided')
    //   socket.disconnect()
    //   return
    // }

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

    socket.on('send_conversation', async (data) => {
      const { sender_id, receive_id, content } = data.payload
      const receiver_socket_id = users[receive_id]?.socket_id

      const conversations = new Conversations({
        sender_id: new ObjectId(sender_id as string),
        receive_id: new ObjectId(receive_id as string),
        content: content
      })
      const result = await databaseService.conversations.insertOne(conversations)
      conversations._id = result.insertedId

      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receive_conversation', {
          payload: conversations
        })
      }
    })

    socket.on('get_user_status', async (target_user_id: string) => {
      if (!target_user_id) return

      try {
        const result = await databaseService.users.findOne({ _id: new ObjectId(target_user_id) })
        const memoryStatus = users[target_user_id]

        const user_status = {
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
      const online_users = Object.entries(users).reduce(
        (acc, [id, status]) => {
          if (status.is_online) {
            acc[id] = status
          }
          return acc
        },
        {} as typeof users
      )

      socket.emit('all_online_users_response', online_users)
    })

    socket.on('disconnect', () => handleDisconnect(socket, user_id))
  })

  return io
}

export default initSocket
