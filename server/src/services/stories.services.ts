import { createNewStoryResBody } from '~/models/request/Stories.requests'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'

class StoriesService {
  async createNewStory({ payload, user_id }: { payload: createNewStoryResBody; user_id: string }) {
    try {
      const _id = new ObjectId()
      const result = await databaseService.stories.insertOne({
        ...payload,
        _id,
        user_id,
        viewer: [],
        is_active: true
      })
      return result
    } catch (error) {
      console.log(error)
    }
  }
}

const storiesService = new StoriesService()
export default storiesService
