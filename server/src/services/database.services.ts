import { MongoClient, Db, Collection } from 'mongodb'
import User from '../models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { Bookmark } from '~/models/schemas/Bookmark.schema'
import { Like } from '~/models/schemas/Like.schema'
import Conversations from '~/models/schemas/conversations.schema'
import { envConfig } from '../constants/config'

const uri = `mongodb+srv://${envConfig.db_username}:${envConfig.db_password}@minhdevmongo.hzvnp.mongodb.net/?retryWrites=true&w=majority&appName=minhdevMongo`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.db_name)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)

      return error
    }
  }
  async indexTweets() {
    const exists = await this.tweets.indexExists(['content_text'])
    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }
  async indexUsers() {
    const exits = await this.users.indexExists(['email_1_password_1', 'email_1'])
    if (!exits) {
      this.users.createIndex({ email: 1, password: 1 }, { unique: true })
      this.users.createIndex({ email: 1 }, { unique: true })
    }
  }
  async indexVideoStatus() {
    const exits = await this.users.indexExists('name_1')
    if (!exits) {
      this.videoStatus.createIndex({ name: 1 }, { unique: true })
    }
  }
  async indexFollowers() {
    const exits = await this.users.indexExists('user_id_1_followed_user_id_1')
    if (!exits) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 }, { unique: true })
    }
  }
  get users(): Collection<User> {
    return this.db.collection(envConfig.usersCollection)
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.tweetsCollection)
  }
  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(envConfig.refreshCollection)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.followersCollection)
  }
  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(envConfig.VideoStatusCollection)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.hashtagsCollection)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.bookmarksCollection)
  }
  get likes(): Collection<Like> {
    return this.db.collection(envConfig.likesCollection)
  }
  get conversations(): Collection<Conversations> {
    return this.db.collection(envConfig.conversationsCollection)
  }
}

const databaseService = new DatabaseService()

export default databaseService
