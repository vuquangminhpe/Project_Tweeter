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
const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3002'
    }
  })
  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}
  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]

    try {
      const decoded_authorization = await verifyAccessToken(access_token)
      const { verify } = decoded_authorization as TokenPayload
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }
      next()
    } catch (error) {
      next(error as ExtendedError)
    }
  })
  io.on('connection', (socket: Socket) => {
    console.log(`user ${socket.id} connected`)
    const user_id = socket.handshake.auth._id
    console.log(user_id)

    users[user_id] = {
      socket_id: socket.id
    }

    socket.on('send_conversation', async (data) => {
      const { sender_id, receive_id, content } = data.payload

      const receiver_socket_id = users[receive_id]?.socket_id
      if (!receiver_socket_id) {
        return
      }
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
    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`user ${socket.id} disconnected`)
    })
  })
}

export default initSocket
