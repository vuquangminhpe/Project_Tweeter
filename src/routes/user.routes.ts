import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  AccessTokenValidator,
  loginValidator,
  RefreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapAsync(loginController))
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
usersRouter.post('/logout', AccessTokenValidator, RefreshTokenValidator, wrapAsync(logoutController))

export default usersRouter
