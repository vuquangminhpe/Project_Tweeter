import express from 'express'
import databaseService from './services/database.services'
import usersRouter from './routes/user.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { config } from 'dotenv'
import staticRouter from './routes/static.routes'
import { initFolderImage, initFolderVideo, initFolderVideoHls } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import cors from 'cors'
import { tweetsRouter } from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import { likesTweetRouter } from './routes/likes.routes'
import { searchRouter } from './routes/search.routes'
import '~/utils/fake'
import '~/utils/s3'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import Conversations from './models/schemas/conversations.schema'
config()
databaseService
  .connect()
  .then(() => {
    databaseService.indexUsers()
    databaseService.indexVideoStatus()
    databaseService.indexFollowers()
    databaseService.indexTweets()
  })
  .catch()

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 3000
app.use(cors())
// Tạo 1 folder upload
initFolderImage()
initFolderVideo()
initFolderVideoHls()
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/static', staticRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesTweetRouter)
app.use('/search', searchRouter)
app.use('/static/video-stream', express.static(UPLOAD_VIDEO_DIR))
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
io.on('connection', (socket: Socket) => {
  console.log(`user ${socket.id} connected`)
  console.log(socket.handshake.auth)
  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }
  console.log(users)

  socket.on('private message', async (data) => {
    const user = users[data.to]
    if (!user) {
      return
    }
    const receiver_socket_id = user.socket_id
    const result = await databaseService.conversations.insertOne(
      new Conversations({
        sender_id: data.from,
        receive_id: data.to,
        content: data.content
      })
    )
    console.log(result)

    socket.to(receiver_socket_id).emit('receive private message', {
      content: data.content,
      from: user_id
    })
  })
  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
  })
})
app.use(defaultErrorHandler)

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
