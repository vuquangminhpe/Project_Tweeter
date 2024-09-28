import express from 'express'
import { userRouter } from './routes/user.routes'
import databaseService from '~/services/database.services'
const app = express()
const port = 5000
app.use(express.json())
app.use('/users', userRouter)
databaseService.connect().catch(console.dir)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
