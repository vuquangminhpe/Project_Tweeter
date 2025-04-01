import { checkSchema } from 'express-validator'
import { MediaTypeQuery } from '../constants/enums'
import { SEARCH_MESSAGE, TWEET_MESSAGE } from '../constants/messages'
import { validate } from '../utils/validation'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: SEARCH_MESSAGE.CONTENT_MUST_BE_STRING
        }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)]
        },
        errorMessage: SEARCH_MESSAGE.MEDIA_TYPE_MUST_BE_ONE_OF_MEDIA_TYPE_QUERY
      },
      people_follow: {
        optional: true,
        isIn: {
          options: ['true', ' false']
        },
        errorMessage: SEARCH_MESSAGE.FOLLOW_USER_IS_TRUE_OR_FALSE
      },
      limit: {
        isNumeric: true,
        custom: {
          options: (value) => {
            if (Number(value) < 1 || Number(value) > 100) {
              throw new Error(SEARCH_MESSAGE.LIMIT_IS_GREATER_THAN_1_AND_SMALL_20)
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value) => {
            if (Number(value) < 1) {
              throw new Error(SEARCH_MESSAGE.PAGE_IS_GREATER_THAN_1_AND_SMALL_TOTAL_PAGES)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
