import { Server, Socket } from 'socket.io'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { ActionType, NotificationStatus } from '~/constants/enums'
import { Notification } from '~/models/schemas/Notification.shema'

export const registerNotificationHandlers = (io: Server, socket: Socket) => {
  socket.on('authenticate', (userData: { userId: string }) => {
    console.log('User authenticated:', userData)

    if (userData && userData.userId) {
      socket.join(userData.userId)
      console.log(`User ${userData.userId} authenticated and joined room`)

      io.emit('user_status_change', {
        userId: userData.userId,
        status: 'online'
      })
    }
  })
  socket.on('get_all_notifications', async (data: { userId: string; page?: number; limit?: number }, callback) => {
    try {
      const { userId } = data
      const page = data.page || 1
      const limit = data.limit || 20
      const skip = (page - 1) * limit

      if (!userId) {
        return callback({
          success: false,
          message: 'UserId is required'
        })
      }

      const aggregationPipeline = [
        {
          $match: {
            userId: userId
          }
        },
        {
          $sort: {
            timestamp: -1
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            let: { senderId: { $toObjectId: '$senderId' } },
            pipeline: [
              {
                $match: { $expr: { $eq: ['$_id', '$$senderId'] } }
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  username: 1,
                  avatar: 1,
                  email: 1,
                  bio: 1
                }
              }
            ],
            as: 'sender'
          }
        },
        {
          $unwind: {
            path: '$sender',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            targetCollection: {
              $switch: {
                branches: [
                  {
                    case: {
                      $in: [
                        '$actionType',
                        [
                          ActionType.TWEET,
                          ActionType.RETWEET,
                          ActionType.QUOTE,
                          ActionType.LIKE,
                          ActionType.UNLIKE,
                          ActionType.COMMENT,
                          ActionType.REPLY,
                          ActionType.MENTION,
                          ActionType.SHARE
                        ]
                      ]
                    },
                    then: 'tweets'
                  },

                  { case: { $in: ['$actionType', [ActionType.COMMENT, ActionType.REPLY]] }, then: 'comments' },

                  {
                    case: {
                      $in: [
                        '$actionType',
                        [
                          ActionType.FOLLOW,
                          ActionType.UNFOLLOW,
                          ActionType.FRIEND_REQUEST,
                          ActionType.FRIEND_REQUEST_ACCEPTED,
                          ActionType.FRIEND_REQUEST_REJECTED
                        ]
                      ]
                    },
                    then: 'followers'
                  },

                  { case: { $in: ['$actionType', [ActionType.STORY]] }, then: 'stories' },

                  { case: { $eq: ['$actionType', ActionType.TAG] }, then: 'hashtags' },

                  { case: { $in: ['$actionType', [ActionType.LIKE, ActionType.UNLIKE]] }, then: 'likes' },

                  { case: { $in: ['$actionType', [ActionType.BOOKMARK]] }, then: 'bookmarks' }
                ],
                default: 'none'
              }
            }
          }
        }
      ]

      const extendedPipeline = [
        ...aggregationPipeline,
        {
          $lookup: {
            from: 'tweets',
            let: { targetId: { $toObjectId: '$targetId' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$targetId'] }, { $eq: ['$targetCollection', 'tweets'] }]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  content: 1,
                  medias: 1,
                  type: 1,
                  audience: 1,
                  created_at: 1,
                  hashtags: 1,
                  mentions: 1
                }
              }
            ],
            as: 'tweetData'
          }
        },
        {
          $lookup: {
            from: 'comments',
            let: { targetId: { $toObjectId: '$targetId' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$targetId'] }, { $eq: ['$targetCollection', 'comments'] }]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  commentContent: 1,
                  tweet_id: 1,
                  createdAt: 1
                }
              }
            ],
            as: 'commentData'
          }
        },
        {
          $lookup: {
            from: 'followers',
            let: { targetId: { $toObjectId: '$targetId' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$targetId'] }, { $eq: ['$targetCollection', 'followers'] }]
                  }
                }
              }
            ],
            as: 'followerData'
          }
        },
        {
          $lookup: {
            from: 'stories',
            let: { targetId: { $toObjectId: '$targetId' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$targetId'] }, { $eq: ['$targetCollection', 'stories'] }]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  media_url: 1,
                  media_type: 1,
                  caption: 1,
                  content: 1,
                  created_at: 1
                }
              }
            ],
            as: 'storyData'
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            let: { targetId: { $toObjectId: '$targetId' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$targetId'] }, { $eq: ['$targetCollection', 'hashtags'] }]
                  }
                }
              }
            ],
            as: 'hashtagData'
          }
        },
        {
          $lookup: {
            from: 'likes',
            let: { targetId: { $toObjectId: '$targetId' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$targetId'] }, { $eq: ['$targetCollection', 'likes'] }]
                  }
                }
              },
              {
                $lookup: {
                  from: 'tweets',
                  let: { tweetId: '$tweet_id' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$tweetId'] } }
                    },
                    {
                      $project: {
                        _id: 1,
                        content: 1,
                        medias: 1
                      }
                    }
                  ],
                  as: 'likedTweet'
                }
              },
              {
                $unwind: {
                  path: '$likedTweet',
                  preserveNullAndEmptyArrays: true
                }
              }
            ],
            as: 'likeData'
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            let: { targetId: { $toObjectId: '$targetId' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$targetId'] }, { $eq: ['$targetCollection', 'bookmarks'] }]
                  }
                }
              },
              {
                $lookup: {
                  from: 'tweets',
                  let: { tweetId: '$tweet_id' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$tweetId'] } }
                    },
                    {
                      $project: {
                        _id: 1,
                        content: 1,
                        medias: 1
                      }
                    }
                  ],
                  as: 'bookmarkedTweet'
                }
              },
              {
                $unwind: {
                  path: '$bookmarkedTweet',
                  preserveNullAndEmptyArrays: true
                }
              }
            ],
            as: 'bookmarkData'
          }
        },
        {
          $addFields: {
            targetData: {
              $switch: {
                branches: [
                  { case: { $eq: ['$targetCollection', 'tweets'] }, then: { $arrayElemAt: ['$tweetData', 0] } },
                  { case: { $eq: ['$targetCollection', 'comments'] }, then: { $arrayElemAt: ['$commentData', 0] } },
                  { case: { $eq: ['$targetCollection', 'followers'] }, then: { $arrayElemAt: ['$followerData', 0] } },
                  { case: { $eq: ['$targetCollection', 'stories'] }, then: { $arrayElemAt: ['$storyData', 0] } },
                  { case: { $eq: ['$targetCollection', 'hashtags'] }, then: { $arrayElemAt: ['$hashtagData', 0] } },
                  { case: { $eq: ['$targetCollection', 'likes'] }, then: { $arrayElemAt: ['$likeData', 0] } },
                  { case: { $eq: ['$targetCollection', 'bookmarks'] }, then: { $arrayElemAt: ['$bookmarkData', 0] } }
                ],
                default: null
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            senderId: 1,
            actionType: 1,
            targetId: 1,
            content: 1,
            timestamp: 1,
            status: 1,
            sender: 1,
            targetData: 1,
            createdAt: '$timestamp'
          }
        }
      ]

      const notifications = await databaseService.notification.aggregate(extendedPipeline)

      const totalCount = await databaseService.notification.countDocuments({ userId: userId })

      callback({
        success: true,
        data: {
          notifications,
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      })

      await databaseService.notification.updateMany(
        { userId: userId, status: NotificationStatus.Unread },
        { $set: { status: NotificationStatus.Read } }
      )

      io.to(userId).emit('notification_count_updated', { count: 0 })
    } catch (error: any) {
      console.error('Error getting notifications:', error)
      callback({
        success: false,
        message: 'Failed to get notifications',
        error: error.message
      })
    }
  })

  socket.on('get_notification_count', async (data: { userId: string }, callback) => {
    try {
      const { userId } = data

      if (!userId) {
        return callback({
          success: false,
          message: 'UserId is required'
        })
      }

      const count = await databaseService.notification.countDocuments({
        userId: userId,
        status: NotificationStatus.Unread
      })

      callback({
        success: true,
        count
      })
    } catch (error: any) {
      console.error('Error getting notification count:', error)
      callback({
        success: false,
        message: 'Failed to get notification count',
        error: error.message
      })
    }
  })

  socket.on('mark_notifications_read', async (data: { userId: string; notificationIds?: string[] }, callback) => {
    try {
      const { userId, notificationIds } = data

      if (!userId) {
        return callback({
          success: false,
          message: 'UserId is required'
        })
      }

      let query: any = { userId: userId, status: NotificationStatus.Unread }

      if (notificationIds && notificationIds.length > 0) {
        query._id = { $in: notificationIds.map((id) => new ObjectId(id)) }
      }

      const updateResult = await databaseService.notification.updateMany(query, {
        $set: { status: NotificationStatus.Read }
      })

      const unreadCount = await databaseService.notification.countDocuments({
        userId: userId,
        status: NotificationStatus.Unread
      })

      io.to(userId).emit('notification_count_updated', { count: unreadCount })

      callback({
        success: true,
        message: 'Notifications marked as read',
        modifiedCount: updateResult.modifiedCount,
        unreadCount
      })
    } catch (error: any) {
      console.error('Error marking notifications as read:', error)
      callback({
        success: false,
        message: 'Failed to mark notifications as read',
        error: error.message
      })
    }
  })

  socket.on(
    'create_notification',
    async (
      notificationData: {
        userId: string
        senderId: string
        actionType: ActionType
        targetId: string
        content: string
      },
      callback
    ) => {
      try {
        const { userId, senderId, actionType, targetId, content } = notificationData

        const notification = new Notification({
          userId,
          senderId,
          actionType,
          targetId,
          content,
          timestamp: new Date(),
          status: NotificationStatus.Unread
        })

        await databaseService.notification.insertOne(notification)

        const sender = await databaseService.users.findOne(
          { _id: new ObjectId(senderId) },
          { projection: { name: 1, username: 1, avatar: 1 } }
        )

        const notificationWithSender = {
          ...notification,
          sender
        }

        io.to(userId).emit('new_notification', notificationWithSender)

        const unreadCount = await databaseService.notification.countDocuments({
          userId,
          status: NotificationStatus.Unread
        })

        io.to(userId).emit('notification_count_updated', { count: unreadCount })

        callback({
          success: true,
          data: notification
        })
      } catch (error: any) {
        console.error('Error creating notification:', error)
        callback({
          success: false,
          message: 'Failed to create notification',
          error: error.message
        })
      }
    }
  )
}
