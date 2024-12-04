import { MediaTypeQuery } from './enums'

export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name must be from 1 to 100',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_VALID: 'Email is valid',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password must be from 6 to 50',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_STRONG:
    'Password must 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbols',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password  must be from 6 to 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbols',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
  EMAIL_NOT_FOUND: 'Email not found',
  PASSWORD_IS_WRONG: 'Password is wrong',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',
  USER_NOT_FOUND: 'User not found',
  ACCESS_TOKEN_IS_VALID: 'Access token is valid',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_VALID: 'Refresh token is valid',
  USED_REFRESH_TOKEN_OR_NOT_EXITS: 'Used refresh token or not exits',
  LOGOUT_SUCCESS: 'Logout success',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resent email verify success',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password success',
  FORGOT_PASSWORD_TOKEN_INVALID: 'Forgot password token invalid',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  GET_ME_SUCCESS: 'Get my profile success',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_FROM_1_TO_200: 'Bio must be from 5 to 200',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH_MUST_BE_FROM_5_TO_200: 'Location must be from 5 to 200',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH_MUST_BE_FROM_5_TO_200: 'Website must be from 5 to 200',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_LENGTH_MUST_BE_FROM_5_TO_50: 'Username must be from 5 to 50',
  USERNAME_INVALID:
    'User name must be 4-15 characters long and contain only letters, numbers, underscores, not only number',
  AVATAR_MUST_BE_A_STRING: 'Avatar must be a string',
  AVATAR_LENGTH_MUST_BE_FROM_1_TO_400: 'Avatar must be from 5 to 400',
  COVER_PHOTO_MUST_BE_A_STRING: 'Cover photo must be a string',
  COVER_PHOTO_LENGTH_MUST_BE_FROM_1_TO_200: 'Cover photo must be from 5 to 200',
  UPDATE_PROFILE_SUCCESS: 'update profile Successfully',
  GET_PROFILE_SUCCESS: 'Get profile success',
  FOLLOWER_SUCCESS: 'Follower success',
  INVALID_FOLLOWED_USER_ID: 'Invalid followed user id',
  CANNOT_FOLLOW_DUPLICATES: 'Followed',
  NO_FOLLOW_USER: 'No follow user',
  UN_FOLLOWER_SUCCESS: 'Un follow success',
  USERNAME_EXISTED: 'Username existed',
  OLD_PASSWORD_IS_WRONG: 'Old password is wrong',
  GMAIL_NOT_VERIFIED: 'Gmail not verified',
  UPLOAD_SUCCESS: 'Upload success',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success',
  GET_VIDEO_STATUS_SUCCESS: 'Get video status success',
  GET_FOLLOWING_SUCCESSFULLY: 'Get following successfully',
  GET_FOLLOWERS_SUCCESSFULLY: 'Get followers successfully'
} as const

export const TWEET_MESSAGE = {
  CREATE_TWEET_SUCCESS: 'Create tweet success',
  INVALID_TYPE: 'Invalid type',
  INVALID_AUDIENCE: 'Invalid audience',
  INVALID_PARENT_ID: 'Invalid parent id',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non empty string',
  CONTENT_MUST_BE_EMPTY_STRING: 'Content must be empty string',
  HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags must be an array of string',
  MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user id',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be an array of media object',
  INVALID_TWEET_ID: 'Invalid tweet id',
  TWEET_NOT_FOUND: 'Tweet not found',
  GET_TWEET_SUCCESS: 'Get tweet success',
  GET_TWEET_DETAILS_SUCCESS: 'Get tweet details success',
  TWEET_IS_NOT_PUBLIC: 'Tweet is not public',
  GET_TWEET_CHILDREN_SUCCESS: 'Get tweet children success',
  TWEET_ID_MUST_BE_A_STRING: 'Tweet id must be a string'
} as const

export const BOOKMARKS_MESSAGE = {
  BOOKMARKS_TWEET_SUCCESS: 'Bookmarks tweet success',
  BOOKMARK_ALREADY_EXISTS: 'Bookmarks already exists',
  UN_BOOKMARKS_TWEET_SUCCESS: 'Un bookmarks tweet success',
  GET_BOOKMARKS_IN_ACCOUNT_SUCCESS: 'Get bookmarks in account success'
}
export const LIKES_MESSAGE = {
  LIKES_TWEET_SUCCESS: 'Likes tweets success',
  UN_LIKES_TWEET_SUCCESS: 'Un likes tweets success',
  ALREADY_LIKED_THIS_TWEET: 'Already liked this tweet',
  ALREADY_UN_LIKED_THIS_TWEET: 'Already un liked this tweet',
  GET_LIKES_SUCCESS: 'Get likes success'
}
export const SEARCH_MESSAGE = {
  CONTENT_MUST_BE_STRING: 'Content must be string',
  MEDIA_TYPE_MUST_BE_ONE_OF_MEDIA_TYPE_QUERY: `Media type must be one of ${Object.values(MediaTypeQuery).join(', ')}`,
  LIMIT_IS_GREATER_THAN_1_AND_SMALL_20: 'Limit is greater than 1 and small 20',
  PAGE_IS_GREATER_THAN_1_AND_SMALL_TOTAL_PAGES: 'Page is greater than 1 and small total pages',
  FOLLOW_USER_IS_TRUE_OR_FALSE: 'Follow user is true or false'
}

export const CONVERSATIONS_MESSAGE = {
  GET_CONVERSATION_SUCCESSFULLY: 'Get conversation successfully'
}
export const COMMENT_MESSAGES = {
  GET_COMMENT_SUCCESS: 'Get comment success',
  CREATE_COMMENT_SUCCESS: 'Create comment success',
  COMMENT_MUST_BE_A_STRING: 'Comment must be a string',
  COMMENT_LENGTH_MUST_BE_BETWEEN_1_AND_280: 'Comment length must be between 1 and 280',
  COMMENT_LINK_MUST_BE_AN_ARRAY: 'Comment link must be an array',
  COMMENT_LINK_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Comment link must be an array of media object'
}
