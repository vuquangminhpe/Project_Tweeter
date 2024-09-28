import { Request, Response } from 'express'

import usersService from '~/services/user.services'

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
export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const result = usersService.register({ email, password })

    return res.json({
      message: 'Register success',
      result
    })
  } catch (error) {
    return res.status(400).json({
      error: 'Register Failed'
    })
  }
}
