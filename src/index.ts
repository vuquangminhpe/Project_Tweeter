import express from 'express'
import databaseService from './services/database.services'
import usersRouter from './routes/user.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
const app = express()
const port = 5000
app.use(express.json())
app.use('/users', usersRouter)
app.use(defaultErrorHandler)
databaseService.connect().catch(console.dir)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
