import { NextFunction, Request, Response } from 'express'
import usersService from '../services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '../models/request/User.request'
import { USERS_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'bson'
import User from '~/models/schemas/User.schema'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const result = await usersService.login(user_id.toString())
  res.status(200).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)

  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}
