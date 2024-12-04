import { ObjectId } from 'bson'
import databaseService from './database.services'
import Comment, { CommentStatus } from '~/models/schemas/Comment.schema'
import { MediaTypeQuery } from '~/constants/enums'
import { COMMENT_MESSAGES } from '~/constants/messages'

class CommentServices {
  async getAllCommentInTweet(tweet_id: string, limit: number, page: number) {
    const comment = await databaseService.comments
      .find({ tweet_id: new ObjectId(tweet_id) })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    const total = await databaseService.comments.countDocuments(comment)
    return { comment, total: total || 0 }
  }
  async createComment(tweet_id: string, user_id: string, commentContent: string, commentLink: CommentStatus[]) {
    const _id = new ObjectId()
    const comment = await databaseService.comments.insertOne(
      new Comment({
        _id,
        tweet_id: new ObjectId(tweet_id),
        user_id: new ObjectId(user_id),
        commentContent,
        commentLink
      })
    )

    return comment
  }
  async editComment(tweet_id: string, user_id: string, new_commentContent: string) {
    if (!new_commentContent) {
      return { message: COMMENT_MESSAGES.NO_EDIT_COMMENT }
    }
    const comment = await databaseService.comments.findOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    if (comment?.commentContent === new_commentContent) {
      return { message: COMMENT_MESSAGES.NO_EDIT_COMMENT }
    }
    const result = await databaseService.comments.updateOne(
      { tweet_id: new ObjectId(tweet_id), user_id: new ObjectId(user_id) },
      { $set: { commentContent: new_commentContent }, $currentDate: { updatedAt: true } }
    )
    return result
  }
  async deleteComment(tweet_id: string, user_id: string) {
    const commentTweet = await databaseService.comments.findOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    if (!commentTweet) {
      return { message: COMMENT_MESSAGES.NO_COMMENT_TO_DELETE }
    }
    const result = await databaseService.comments.deleteOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    return result
  }
}

const commentServices = new CommentServices()
export default commentServices
