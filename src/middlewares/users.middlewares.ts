import { checkSchema } from 'express-validator'
import { validate } from '../utils/validation'
import usersService from '../services/user.services'
import { ErrorWithStatus } from '~/models/Errors'

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value: any) => {
          const isExitEmail = await usersService.checkEmailExits(value)
          if (isExitEmail) {
            throw new ErrorWithStatus({ message: 'Email already exits', status: 400 })
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 6,
          max: 50
        }
      },
      isStrongPassword: {
        options: {
          minLength: 6
        }
      },
      errorMessage: 'Password must be between 6 and 50 characters'
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 6,
          max: 50
        }
      },
      isStrongPassword: {
        options: {
          minLength: 6
        }
      },
      errorMessage: 'Password must be between 6 and 50 characters',
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Confirm password does not match')
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)
