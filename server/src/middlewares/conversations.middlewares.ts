import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { Request, Response } from 'express'
import { ErrorWithStatus } from '~/models/Errors'
import { CONVERSATIONS_MESSAGE } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
export const messageUploadValidator = validate(checkSchema({ message: { isString: true } }, ['body']))
export const editMessageValidator = validate(
  checkSchema(
    {
      messages_id: {
        custom: {
          options: async (value, { req }) => {
            const _id = (req as Request).params.messages_id
            console.log(_id)

            if (!_id) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGE.MESSAGE_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const message = await databaseService.conversations.findOne({
              _id: new ObjectId(_id as string)
            })
            if (!message) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGE.MESSAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const deleteMessageValidator = validate(
  checkSchema(
    {
      messages_id: {
        custom: {
          options: async (value, { req }) => {
            const _id = (req as Request).params.messages_id
            console.log(_id)

            if (!_id) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGE.MESSAGE_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const message = await databaseService.conversations.findOne({
              _id: new ObjectId(_id as string)
            })
            if (!message) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGE.MESSAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const deleteAllMessageInConversationValidator = validate(
  checkSchema({ conversation_id: { isString: true } }, ['params'])
)
