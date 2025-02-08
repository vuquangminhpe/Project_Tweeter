import { Server } from 'socket.io'
import Stories from '~/models/schemas/Stories.schema'
import databaseService from '../database.services'
import { ObjectId } from 'mongodb'

class AutoDeleteStoriesSystem {
  private io: Server | null
  private checkInterval: NodeJS.Timeout | null

  constructor() {
    this.io = null
    this.checkInterval = null
  }

  initialize(io: Server) {
    this.io = io
    this.startExpiryCheck()
  }

  private startExpiryCheck() {
    this.checkInterval = setInterval(async () => {
      await this.deleteExpiredStories()
    }, 60 * 1000)
  }

  private async deleteExpiredStories() {
    try {
      const now = new Date()

      const expiredStories = await databaseService.stories
        .find({
          expires_at: { $lte: now },
          is_active: true
        })
        .toArray()

      if (!expiredStories.length) {
        return
      }

      const expiredStoryIds = expiredStories
        .map((story: Stories) => story._id)
        .filter((id): id is ObjectId => id !== undefined)

      const result = await databaseService.stories.updateMany(
        {
          _id: { $in: expiredStoryIds }
        },
        {
          $set: { is_active: false }
        }
      )

      if (this.io && result.modifiedCount > 0) {
        expiredStories.forEach((story: Stories) => {
          this.io?.emit('story_deleted', {
            story_id: story?._id?.toString(),
            user_id: story.user_id.toString(),
            expired_at: story.expires_at
          })
        })

        console.log(`Deleted ${result.modifiedCount} expired stories`)
      }
    } catch (error) {
      console.error('Error in deleteExpiredStories:', error)
    }
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }
}

const autoDeleteSystem = new AutoDeleteStoriesSystem()
export default autoDeleteSystem
