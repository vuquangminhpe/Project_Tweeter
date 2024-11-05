import { TweetRequestBody } from '~/models/request/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'

class TweetService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )

    return hashtagDocuments.map((hashtag) => hashtag?._id as ObjectId)
  }
  async createTweet(body: TweetRequestBody, user_id: string) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)
    const results = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        guest_views: 0,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    const tweet = await databaseService.tweets.findOne({ _id: results.insertedId })
    return tweet
  }
  async getTweet(user_id: string) {
    const allTweet = await databaseService.tweets
      .find({
        user_id: new ObjectId(user_id)
      })
      .toArray()
    return allTweet
  }
  async getTweetDetails(tweet_id: string) {
    const tweet = await databaseService.tweets.findOne({
      _id: new ObjectId(tweet_id)
    })

    return tweet
  }
}
const tweetsService = new TweetService()
export default tweetsService
