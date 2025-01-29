import { ExtendedError, Server, Socket } from 'socket.io'
import { verifyAccessToken } from './common'
import { TokenPayload } from '~/models/request/User.request'
import { UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import Conversations from '~/models/schemas/conversations.schema'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { Server as ServerHttp } from 'http'

interface UserStatus {
  socket_id: string
  is_online: boolean
  last_active: Date
  timeoutId?: NodeJS.Timeout
}

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3002'
    }
  })

  const users: {
    [key: string]: UserStatus
  } = {}

  io.on('connection', async (socket: Socket) => {
    const user_id = socket.handshake.auth._id
    console.log(`User ${user_id} connected with socket ${socket.id}`)
    if (users[user_id]?.timeoutId) {
      clearTimeout(users[user_id].timeoutId)
    }
    users[user_id] = {
      socket_id: socket.id,
      is_online: true,
      last_active: new Date(),
      timeoutId: undefined
    }

    try {
      if (user_id) {
        await databaseService.users.updateOne(
          { _id: new ObjectId(user_id as string) },
          {
            $set: {
              is_online: true,
              last_active: new Date()
            }
          }
        )
      }

      socket.broadcast.emit('user_status_change', {
        user_id,
        is_online: true,
        last_active: new Date()
      })
    } catch (error) {
      console.error('Error updating user status:', error)
    }

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

      socket.to(receiver_socket_id).emit('receive_conversation', {
        payload: conversations
      })
    })

    socket.on('get_user_status', async (target_user_id: string) => {
      if (!target_user_id) return
      const result = await databaseService.users.findOne({ _id: new ObjectId(target_user_id) })
      const user_status = users[target_user_id] || {
        is_online: false,
        last_active: result?.last_active
      }

      console.log(`User ${user_id} requested status of user ${target_user_id}`, {
        is_online: user_status.is_online,
        last_active: user_status.last_active
      })

      socket.emit('user_status_response', {
        user_id: target_user_id,
        is_online: user_status.is_online,
        last_active: user_status.last_active?.toISOString() || null
      })
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

    socket.on('disconnect', async () => {
      console.log(`User ${user_id} disconnected`)

      if (users[user_id]) {
        users[user_id].is_online = false
        users[user_id].last_active = new Date()

        try {
          await databaseService.users.updateOne(
            { _id: new ObjectId(user_id as string) },
            {
              $set: {
                is_online: false,
                last_active: new Date()
              }
            }
          )

          socket.broadcast.emit('user_status_change', {
            user_id,
            is_online: false,
            last_active: new Date()
          })
        } catch (error) {
          console.error('Error updating user status:', error)
        }

        const timeoutId = setTimeout(() => {
          delete users[user_id]
        }, 3600000)
        users[user_id].timeoutId = timeoutId
      }
    })
  })
}

export default initSocket
