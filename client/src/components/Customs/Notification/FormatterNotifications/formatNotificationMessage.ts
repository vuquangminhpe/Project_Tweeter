import { ActionType } from '@/types/Notifications.types'

interface FormatOptions {
  senderName: string
  targetType?: string
  targetName?: string
  contentPreview?: string
}

export const formatNotificationMessage = (actionType: ActionType, options: FormatOptions): string => {
  const { senderName, targetType, targetName, contentPreview } = options

  switch (actionType) {
    case ActionType.TWEET:
      return `${senderName} published a new tweet`

    case ActionType.RETWEET:
      return `${senderName} retweeted your tweet${contentPreview ? `: "${truncateText(contentPreview, 30)}"` : ''}`

    case ActionType.QUOTE:
      return `${senderName} quoted your tweet${contentPreview ? `: "${truncateText(contentPreview, 30)}"` : ''}`

    case ActionType.MENTION:
      return `${senderName} mentioned you in a tweet${contentPreview ? `: "${truncateText(contentPreview, 30)}"` : ''}`

    case ActionType.TAG:
      return `${senderName} tagged you in a tweet${contentPreview ? `: "${truncateText(contentPreview, 30)}"` : ''}`

    case ActionType.SHARE:
      return `${senderName} shared your tweet${contentPreview ? `: "${truncateText(contentPreview, 30)}"` : ''}`

    case ActionType.COMMENT:
      return `${senderName} commented on your tweet${contentPreview ? `: "${truncateText(contentPreview, 30)}"` : ''}`

    case ActionType.REPLY:
      return `${senderName} replied to your comment${contentPreview ? `: "${truncateText(contentPreview, 30)}"` : ''}`

    case ActionType.LIKE:
      return `${senderName} liked your ${targetType || 'post'}`

    case ActionType.UNLIKE:
      return `${senderName} unliked your ${targetType || 'post'}`

    case ActionType.FOLLOW:
      return `${senderName} started following you`

    case ActionType.UNFOLLOW:
      return `${senderName} unfollowed you`

    case ActionType.FRIEND_REQUEST:
      return `${senderName} sent you a friend request`

    case ActionType.FRIEND_REQUEST_ACCEPTED:
      return `${senderName} accepted your friend request`

    case ActionType.FRIEND_REQUEST_REJECTED:
      return `${senderName} rejected your friend request`

    case ActionType.STORY:
      return `${senderName} added a new story`

    case ActionType.BOOKMARK:
      return `${senderName} bookmarked your tweet`

    case ActionType.REPORT:
      return `${senderName} reported content: ${targetName || 'unknown content'}`

    case ActionType.BLOCK:
      return `${senderName} blocked you`

    case ActionType.UNBLOCK:
      return `${senderName} unblocked you`

    case ActionType.MUTE:
      return `${senderName} muted you`

    case ActionType.UNMUTE:
      return `${senderName} unmuted you`

    default:
      return `${senderName} interacted with your content`
  }
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const getNotificationIcon = (actionType: ActionType): string => {
  switch (actionType) {
    case ActionType.TWEET:
    case ActionType.RETWEET:
    case ActionType.QUOTE:
      return 'message-circle'

    case ActionType.MENTION:
    case ActionType.TAG:
      return 'at-sign'

    case ActionType.COMMENT:
    case ActionType.REPLY:
      return 'message-square'

    case ActionType.LIKE:
    case ActionType.UNLIKE:
      return 'heart'

    case ActionType.FOLLOW:
    case ActionType.UNFOLLOW:
    case ActionType.FRIEND_REQUEST:
    case ActionType.FRIEND_REQUEST_ACCEPTED:
    case ActionType.FRIEND_REQUEST_REJECTED:
      return 'user-plus'

    case ActionType.SHARE:
      return 'share-2'

    case ActionType.STORY:
      return 'camera'

    case ActionType.BOOKMARK:
      return 'bookmark'

    case ActionType.REPORT:
      return 'flag'

    case ActionType.BLOCK:
    case ActionType.UNBLOCK:
      return 'slash'

    case ActionType.MUTE:
    case ActionType.UNMUTE:
      return 'volume-x'

    default:
      return 'bell'
  }
}
