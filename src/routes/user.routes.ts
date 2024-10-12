import { Router } from 'express'
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController
} from '~/controllers/users.controllers'
import {
  AccessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  RefreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapAsync(loginController))
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
usersRouter.post('/logout', AccessTokenValidator, RefreshTokenValidator, wrapAsync(logoutController))
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyController))
usersRouter.post('/resend-verify-email', AccessTokenValidator, wrapAsync(resendVerifyEmailController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

export default usersRouter
