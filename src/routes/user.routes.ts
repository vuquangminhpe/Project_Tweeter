import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { AccessTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapAsync(loginController))
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
usersRouter.post(
  '/logout',
  AccessTokenValidator,
  wrapAsync((req, res) => {
    res.json('oke')
  })
)

export default usersRouter
