import express from 'express'
import databaseService from './services/database.services'
import usersRouter from './routes/user.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { config } from 'dotenv'
import staticRouter from './routes/static.routes'
import { initFolderImage, initFolderVideo } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import cors from 'cors'
import { tweetsRouter } from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import { likesTweetRouter } from './routes/likes.routes'
import { searchRouter } from './routes/search.routes'
import '~/utils/fake'
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
const port = process.env.PORT || 3000
app.use(cors())
// Tạo 1 folder upload
initFolderImage()
initFolderVideo()
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/static', staticRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesTweetRouter)
app.use('/search', searchRouter)
app.use('/static/video-stream', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
