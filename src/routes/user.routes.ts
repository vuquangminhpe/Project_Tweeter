import { Router } from 'express'
import {
  changePasswordController,
  emailVerifyController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  UnController,
  updateMeController,
  VerifyForgotPasswordController
} from '~/controllers/users.controllers'
import {
  AccessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  RefreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapAsync(loginController))
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
usersRouter.post('/logout', AccessTokenValidator, RefreshTokenValidator, wrapAsync(logoutController))
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyController))
usersRouter.post('/resend-verify-email', AccessTokenValidator, wrapAsync(resendVerifyEmailController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(VerifyForgotPasswordController)
)

usersRouter.post('/reset-password', resetPasswordValidator, wrapAsync(resetPasswordController))

/**
 * Description: Get my profile
 * Path: /me
 * method: GET
 * Header: {Authorization: Bearer <access_token>}
 */
usersRouter.get('/me', AccessTokenValidator, verifiedUserValidator, wrapAsync(getMeController))

/**
 * Description: Update my profile
 * Path: /me
 * method: PATCH
 * Header: {Authorization: Bearer <access_token>}
 * body: User Schema
 */
usersRouter.patch('/me', AccessTokenValidator, verifiedUserValidator, updateMeValidator, wrapAsync(updateMeController))

/**
 * Description: get user profile
 * Path: /:username
 * method: GET
 */
usersRouter.get('/:username', wrapAsync(getProfileController))

/**
 * Description: follow someone
 * Path: /follow
 * method: post
 * body: {user_id: string}
 * Header: {followed_user_id: string}
 */
usersRouter.post('/follow', AccessTokenValidator, verifiedUserValidator, followValidator, wrapAsync(followController))

/**
 * Description: follow someone
 * Path: /un-follow
 * method: post
 * body: {user_id: string}
 * Header: {followed_user_id: string}
 */
usersRouter.post('/un-follow', AccessTokenValidator, verifiedUserValidator, followValidator, wrapAsync(UnController))
usersRouter.post(
  '/change-password',
  AccessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

export default usersRouter
