import { NextFunction, Request, Response } from 'express'
import usersService from '../services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '../models/request/User.request'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'minhdev123' && password === 'minh123') {
    return res.status(200).json({
      message: 'Login Success'
    })
  }
  return res.status(400).json({
    error: 'Login Failed'
  })
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
