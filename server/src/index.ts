import express from 'express'
import databaseService from './services/database.services'
import usersRouter from './routes/user.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { config } from 'dotenv'
import staticRouter from './routes/static.routes'
import { initFolderImage, initFolderVideo, initFolderVideoHls } from './utils/file'
import { UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_HLS_DIR } from './constants/dir'
import cors, { CorsOptions } from 'cors'
import { tweetsRouter } from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import { likesTweetRouter } from './routes/likes.routes'
import { searchRouter } from './routes/search.routes'
// import '~/utils/fake'
import '~/utils/s3'
import { createServer } from 'http'
import helmet from 'helmet'
import conversationsRouter from './routes/conversations.routes'
import initSocket from './utils/socket'
import { envConfig, isProduction } from './constants/config'
import rateLimit from 'express-rate-limit'
import commentsRouter from './routes/comments.routes'
import tweetGeminiRoutes from './routes/tweetGemini.routes'
import storiesRouter from './routes/stories.routes'
import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import autoDeleteSystem from './services/System/AutoDeleteStoriesSystem.system'

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
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15p
//   max: 100, // 1 IP => 100 requests 15 phút
//   standardHeaders: true,
//   legacyHeaders: false
// })
// // => trả về lỗi 429 mặc định => giới hạn requests
const app = express()
const httpServer = createServer(app)
const port = envConfig.port || 3002
app.use(helmet())
const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.client_url : '*',
  optionsSuccessStatus: 200
}

// app.use(limiter)
app.use(cors(corsOptions))
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
app.use('/conversations', conversationsRouter)
app.use('/comments', commentsRouter)
app.use('/geminiTweet', tweetGeminiRoutes)
app.use('/stories', storiesRouter)
// app.use('/static/video-hls', express.static(UPLOAD_VIDEO_HLS_DIR))

app.use(defaultErrorHandler)
const io = initSocket(httpServer)
autoDeleteSystem.initialize(io)

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
