import { NextFunction, Request, Response } from 'express'
import usersService from '../services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '../models/request/User.request'
import { USERS_MESSAGES } from '~/constants/messages'

export const loginController = async (req: Request, res: Response) => {
  const { user }: any = req
  const { _id } = user
  console.log(_id)
  console.log(user)

  const { email, password } = req.body
  const result = await usersService.checkUsersExists(email, password)
  usersService.login(_id.toString())
  if (!result) {
    return res.status(200).json({
      message: 'Login Success'
    })
  }
  return res.status(400).json({ errors: USERS_MESSAGES.PASSWORD_IS_WRONG })
}
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)

  return res.json({
    message: 'Register success',
    result
  })
}
