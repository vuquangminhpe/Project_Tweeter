import { NextFunction, Response, Request } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGE, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'
const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)
export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetTypes],
        errorMessage: TWEET_MESSAGE.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [tweetAudiences],
        errorMessage: TWEET_MESSAGE.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          //Nếu type là retweet,comment,quoteweet thì parent_id phải là tweet_id của tweet cha
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            if (!value) throw new Error(TWEET_MESSAGE.INVALID_PARENT_ID)
          }
          // Nếu type là tweet thì parent_id phải là null
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEET_MESSAGE.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          //Nếu type là retweet,comment,quoteweet và không có mentions và hasgtags thì content phải là string và không được rỗng

          if (
            [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            if (!value) throw new Error(TWEET_MESSAGE.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }
          // Nếu type là retweet thì content phải là ''
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEET_MESSAGE.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là string
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error(TWEET_MESSAGE.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là user_id
          if (value.some((item: any) => !ObjectId.isValid(item))) {
            throw new Error(TWEET_MESSAGE.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là Media Object
          if (
            value.some((item: any) => {
              return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
            })
          ) {
            throw new Error(TWEET_MESSAGE.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)
export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isMongoId: {
          errorMessage: new ErrorWithStatus({
            message: TWEET_MESSAGE.INVALID_TWEET_ID,
            status: HTTP_STATUS.BAD_REQUEST
          })
        },
        custom: {
          options: async (value: string, { req }) => {
            const tweet = await databaseService.tweets.findOne({
              _id: new ObjectId(value)
            })
            if (!tweet)
              throw new ErrorWithStatus({
                message: TWEET_MESSAGE.TWEET_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

//Sử dụng async await trong handler express thì phải có try catch
// Nếu không dùng try catch thì dùng wrapRequest
export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet

  if (tweet.audience === TweetAudience.TwitterCircle) {
    // Kiểm tra người xem tweet này đã đăng nhập hay chưa
    if (!req.decode_authorization) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    // Kiểm tra tài khoản khán giả có ổn (bị khóa hay bị xóa chưa)
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    })
    console.log(author)

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    // TWEET này có trong twitter circle của tác giả hay không hoặc ko phải auuthor
    const { user_id } = req.decode_authorization
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
    if (!author._id.equals(user_id) && !isInTwitterCircle) {
      throw new ErrorWithStatus({ message: TWEET_MESSAGE.TWEET_IS_NOT_PUBLIC, status: HTTP_STATUS.FORBIDDEN })
    }
  }
  next()
}
