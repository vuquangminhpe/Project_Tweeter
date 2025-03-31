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
import Comment from '~/models/schemas/Comment.schema'
import Stories from '~/models/schemas/Stories.schema'
import { Notification } from '~/models/schemas/Notification.shema'
import { Payment } from '~/models/schemas/Payment.schema'
import { Ban } from '~/models/schemas/Ban.schemas'
import { Report } from '~/models/schemas/Report.schemas'

const uri = envConfig.mongodb_url

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
  async indexReports() {
    const existsContentIndex = await this.reports.indexExists('content_id_1_content_type_1')
    if (!existsContentIndex) {
      this.reports.createIndex({ content_id: 1, content_type: 1 })
    }

    const existsStatusIndex = await this.reports.indexExists('status_1')
    if (!existsStatusIndex) {
      this.reports.createIndex({ status: 1 })
    }

    const existsDateIndex = await this.reports.indexExists('created_at_1')
    if (!existsDateIndex) {
      this.reports.createIndex({ created_at: 1 })
    }
  }

  async indexBans() {
    const existsUserIndex = await this.bans.indexExists('user_id_1')
    if (!existsUserIndex) {
      this.bans.createIndex({ user_id: 1 })
    }

    const existsActiveIndex = await this.bans.indexExists('user_id_1_is_active_1')
    if (!existsActiveIndex) {
      this.bans.createIndex({ user_id: 1, is_active: 1 })
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
  get comments(): Collection<Comment> {
    return this.db.collection(envConfig.commentCollection)
  }
  get stories(): Collection<Stories> {
    return this.db.collection(envConfig.storiesCollection)
  }
  get notification(): Collection<Notification> {
    return this.db.collection(envConfig.notificationCollection)
  }
  get payments(): Collection<Payment> {
    return this.db.collection(envConfig.paymentCollection)
  }
  get bans(): Collection<Ban> {
    return this.db.collection(envConfig.bansCollection)
  }
  get reports(): Collection<Report> {
    return this.db.collection(envConfig.reportsCollection)
  }
}

const databaseService = new DatabaseService()

export default databaseService
