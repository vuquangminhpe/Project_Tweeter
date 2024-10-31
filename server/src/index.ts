import express from 'express'
import databaseService from './services/database.services'
import usersRouter from './routes/user.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { config } from 'dotenv'
import staticRouter from './routes/static.routes'
import { initFolderImage, initFolderVideo } from './utils/file'

config()
const app = express()
const port = process.env.PORT || 3000

// Tạo 1 folder upload
initFolderImage()
initFolderVideo()
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)

app.use('/static', staticRouter)
app.use(defaultErrorHandler)
databaseService.connect().catch(console.dir)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
