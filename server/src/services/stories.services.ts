import { createNewStoryResBody, viewAndStatusStoryResBody } from '~/models/request/Stories.requests'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import Stories from '~/models/schemas/Stories.schema'

class StoriesService {
  async createNewStory({ payload, user_id }: { payload: createNewStoryResBody; user_id: string }) {
    try {
      const _id = new ObjectId()
      const result = await databaseService.stories.insertOne(
        new Stories({
          ...payload,
          _id,
          user_id: new ObjectId(user_id),
          viewer: [],
          is_active: true
        })
      )
      const story = await databaseService.stories.findOne({ _id: new ObjectId(result.insertedId) })
      return story
    } catch (error) {
      console.log(error)
    }
  }

  async viewAndStatusStory({ payload, user_id }: { payload: viewAndStatusStoryResBody; user_id: string }) {
    try {
      const result = await databaseService.stories.findOneAndUpdate(
        {
          _id: new ObjectId(payload.story_id),
          user_id: new ObjectId(user_id)
        },
        {
          $push: {
            viewer: {
              viewer_id: [new ObjectId(user_id)],
              seen_at: new Date(),
              content: payload.content,
              view_status: payload.view_status
            }
          }
        },
        {
          returnDocument: 'after'
        }
      )
      return result?.viewer
    } catch (error) {
      console.log(error)
    }
  }
  async updateStory({ payload, user_id }: { payload: any; user_id: string }) {
    try {
      const result = await databaseService.stories.findOneAndUpdate(
        {
          _id: new ObjectId(payload.story_id as string),
          user_id: new ObjectId(user_id)
        },
        {
          $set: {
            ...payload
          }
        },
        {
          returnDocument: 'after'
        }
      )
      return result
    } catch (error) {
      console.log(error)
    }
  }
}

const storiesService = new StoriesService()
export default storiesService
