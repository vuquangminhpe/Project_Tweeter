import express from 'express'
import databaseService from './services/database.services'
import usersRouter from './routes/user.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
config()
const app = express()
const port = process.env.PORT || 3000

// Tạo 1 folder upload
initFolder()
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use(defaultErrorHandler)
databaseService.connect().catch(console.dir)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
