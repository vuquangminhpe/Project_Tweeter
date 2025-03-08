import { Server, Socket } from 'socket.io'
import Conversations from '~/models/schemas/conversations.schema'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { Server as ServerHttp } from 'http'
import { ActionType, NotificationStatus } from '~/constants/enums'
import { Notification } from '~/models/schemas/Notification.shema'

interface UserStatus {
  socket_id: string
  is_online: boolean
  last_active: Date
  timeoutId?: NodeJS.Timeout
  heartbeatTimeout?: NodeJS.Timeout
}

const HEARTBEAT_INTERVAL = 30000
const CLEANUP_TIMEOUT = 3600000

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3002'
    }
  })

  const users: {
    [key: string]: UserStatus
  } = {}

  const updateUserStatus = async (
    user_id: string,
    status: { is_online: boolean; last_active: Date },
    broadcast: boolean = true
  ) => {
    try {
      await databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            is_online: status.is_online,
            last_active: status.last_active
          }
        }
      )

      if (broadcast) {
        io.emit('user_status_change', {
          user_id,
          ...status
        })
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const setupHeartbeat = (socket: Socket, user_id: string) => {
    if (users[user_id]?.heartbeatTimeout) {
      clearTimeout(users[user_id].heartbeatTimeout)
    }

    users[user_id].heartbeatTimeout = setInterval(async () => {
      if (!socket.connected) {
        await handleDisconnect(socket, user_id)
      }
    }, HEARTBEAT_INTERVAL)
  }

  const handleDisconnect = async (socket: Socket, user_id: string) => {
    console.log(`User ${user_id} disconnected from socket ${socket.id}`)

    if (users[user_id]) {
      if (users[user_id].heartbeatTimeout) {
        clearInterval(users[user_id].heartbeatTimeout)
      }
      if (users[user_id].timeoutId) {
        clearTimeout(users[user_id].timeoutId)
      }

      users[user_id].is_online = false
      users[user_id].last_active = new Date()

      await updateUserStatus(user_id, {
        is_online: false,
        last_active: new Date()
      })

      users[user_id].timeoutId = setTimeout(() => {
        console.log(`Cleaning up user ${user_id} from memory`)
        delete users[user_id]
      }, CLEANUP_TIMEOUT)
    }
  }

  io.on('connection', async (socket: Socket) => {
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

        const totalCount = await databaseService.notification.countDocuments({ userId: new ObjectId(userId) })

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
          { userId: new ObjectId(userId), status: NotificationStatus.Unread },
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
          userId: new ObjectId(userId),
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
          userId: new ObjectId(userId),
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
            userId: new ObjectId(userId),
            senderId: new ObjectId(senderId),
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
            userId: new ObjectId(userId),
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
    const user_id = socket.handshake.auth._id
    // if (!user_id) {
    //   console.error('User ID not provided')
    //   socket.disconnect()
    //   return
    // }

    console.log(`User ${user_id} connected with socket ${socket.id}`)

    if (users[user_id]) {
      if (users[user_id].timeoutId) clearTimeout(users[user_id].timeoutId)
      if (users[user_id].heartbeatTimeout) clearInterval(users[user_id].heartbeatTimeout)
    }

    users[user_id] = {
      socket_id: socket.id,
      is_online: true,
      last_active: new Date()
    }

    setupHeartbeat(socket, user_id)

    await updateUserStatus(user_id, {
      is_online: true,
      last_active: new Date()
    })

    socket.on('send_conversation', async (data) => {
      const { sender_id, receive_id, content } = data.payload
      const receiver_socket_id = users[receive_id]?.socket_id

      const conversations = new Conversations({
        sender_id: new ObjectId(sender_id as string),
        receive_id: new ObjectId(receive_id as string),
        content: content
      })
      const result = await databaseService.conversations.insertOne(conversations)
      conversations._id = result.insertedId

      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receive_conversation', {
          payload: conversations
        })
      }
    })

    socket.on('get_user_status', async (target_user_id: string) => {
      if (!target_user_id) return

      try {
        const result = await databaseService.users.findOne({ _id: new ObjectId(target_user_id) })
        const memoryStatus = users[target_user_id]

        const user_status = {
          user_id: target_user_id,
          is_online: memoryStatus?.is_online || false,
          last_active: memoryStatus?.last_active || result?.last_active || new Date()
        }

        socket.emit('user_status_response', user_status)
      } catch (error) {
        console.error('Error fetching user status:', error)
        socket.emit('user_status_response', {
          user_id: target_user_id,
          is_online: false,
          last_active: new Date()
        })
      }
    })

    socket.on('get_all_online_users', () => {
      const online_users = Object.entries(users).reduce(
        (acc, [id, status]) => {
          if (status.is_online) {
            acc[id] = status
          }
          return acc
        },
        {} as typeof users
      )

      socket.emit('all_online_users_response', online_users)
    })

    socket.on('disconnect', () => handleDisconnect(socket, user_id))
  })

  return io
}

export default initSocket
