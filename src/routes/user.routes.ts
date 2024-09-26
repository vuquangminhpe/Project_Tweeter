import { Router } from 'express'

const userRouter = Router()
userRouter.post('login', loginValidator, loginController)
