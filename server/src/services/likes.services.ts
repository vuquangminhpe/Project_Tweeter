import { Like } from '~/models/schemas/Like.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { LIKES_MESSAGE } from '~/constants/messages'

class LikesTweet {
  async likeTweet(user_id: string, tweet_id: string) {
    const existsLike = await databaseService.likes.findOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    if (!existsLike) {
      const result = await databaseService.likes.insertOne(
        new Like({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      )
      return { message: LIKES_MESSAGE.LIKES_TWEET_SUCCESS, result: result }
    } else {
      return { message: LIKES_MESSAGE.ALREADY_LIKED_THIS_TWEET }
    }
  }
  async unLikesTweet(user_id: string, tweet_id: string) {
    const existsLike = await databaseService.likes.findOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    if (existsLike) {
      const result = await databaseService.likes.deleteOne({
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      })
      return { message: LIKES_MESSAGE.UN_LIKES_TWEET_SUCCESS, result: result }
    } else {
      return { message: LIKES_MESSAGE.ALREADY_UN_LIKED_THIS_TWEET }
    }
  }
  async getLikesTweet(user_id: string, tweet_id: string) {
    const getLikeUserTweet = await databaseService.likes
      .find({
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      })
      .toArray()
    return getLikeUserTweet
  }
}

const likesTweet = new LikesTweet()
export default likesTweet
