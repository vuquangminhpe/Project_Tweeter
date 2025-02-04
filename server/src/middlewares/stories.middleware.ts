import { ObjectId } from 'mongodb'
import { checkSchema } from 'express-validator'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'
import { Request } from 'express'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { STORIES_MESSAGE, USERS_MESSAGES } from '~/constants/messages'
export const createNewStoryValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: STORIES_MESSAGE.CONTENT_MUST_BE_A_STRING
        },
        notEmpty: { errorMessage: STORIES_MESSAGE.CONTENT_MUST_NOT_BE_EMPTY }
      },
      media_url: {
        isURL: true,
        optional: { options: { nullable: true } }
      },
      media_type: {
        isString: true,
        optional: { options: { nullable: true } }
      },
      caption: {
        isString: {
          errorMessage: STORIES_MESSAGE.CAPTION_MUST_BE_A_STRING
        },
        errorMessage: STORIES_MESSAGE.CAPTION_MUST_BE_NOT_BE_EMPTY,
        optional: { options: { nullable: true } }
      },
      privacy: {
        isArray: true,
        custom: {
          options: async (value, { req }) => {
            if (!value || !Array.isArray(value)) {
              throw new ErrorWithStatus({
                message: 'Privacy must be an array',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            for (const element of value) {
              if (!/^[0-9a-fA-F]{24}$/.test(element)) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.INVALID_USER_ID,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              }

              const userPrivacy = await databaseService.users.findOne({
                _id: new ObjectId(element as string)
              })

              if (!userPrivacy) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USER_NOT_FOUND,
                  status: HTTP_STATUS.NOT_FOUND
                })
              }
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)
