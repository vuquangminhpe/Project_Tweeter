export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video,
  HLS
}
export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}
export enum EncodingStatus {
  Pending, //hàng đợi
  Processing, //Đang encode
  Success, // Encode thành công
  Failed // Encode thất bại
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}
export enum TweetAudience {
  Everyone,
  TwitterCircle
}
