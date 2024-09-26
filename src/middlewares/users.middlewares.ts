import { error } from 'console'
import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing email or password'
    })
  }
  next()
}

export const registerValidator = checkSchema({
  email: 
})
