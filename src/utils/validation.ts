import * as express from 'express'
import { ContextRunner, ValidationChain } from 'express-validator'
import httpStatus from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

// can be reused by many routes
export const validate = (validations: ContextRunner[]) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // sequential processing, stops running validations chain if one fails.
    for (const validation of validations) {
      const errors = await validation.run(req)
      const errorsObject = errors.mapped()
      for (const key in errorsObject) {
        const { msg } = errorsObject[key]
        if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
          return next(msg)
        }
      }
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errorsObject })
      }
    }

    next()
  }
}
