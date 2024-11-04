import { TweetRequestBody } from '~/models/request/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'

class TweetService {
  async createTweet(body: TweetRequestBody, user_id: string) {
    const results = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        guest_views: 0,
        hashtags: [],
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
}
const tweetsService = new TweetService()
export default tweetsService
