import databaseService from './database.services'

class CommentServices {
  async getAllCommentInTweet(tweet_id: string, limit: number, page: number) {
    const comment = await databaseService.comments
      .find({ tweet_id })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    const total = await databaseService.comments.countDocuments({ tweet_id })
    return { comment, total: total || 0 }
  }
}

const commentServices = new CommentServices()
export default commentServices
