import { Request, Response } from 'express'
import { CONVERSATIONS_MESSAGE } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  deleteMessageInConversationResBody,
  editMessageInConversationResBody,
  GetAllConversationsParams,
  GetConversationsParams,
  setEmojiMessageInConversationResBody
} from '~/models/request/Conversations.requests'
import conversationServices from '~/services/conversations.services'
import { TokenPayload } from '~/models/request/User.request'
export const getConversationsByReceiverIdController = async (req: Request<GetConversationsParams>, res: Response) => {
  const { receiver_id } = req.params
  const { limit, page } = req.query
  const sender_id = req.decode_authorization?.user_id as string

  const { conversations, total } = await conversationServices.getConversations({
    sender_id,
    receiver_id,
    limit: Number(limit),
    page: Number(page)
  })
  res.json({
    message: CONVERSATIONS_MESSAGE.GET_CONVERSATION_SUCCESSFULLY,
    result: {
      conversations,
      page: page,
      total_pages: Math.ceil(total / Number(limit))
    }
  })
}

export const getAllConverSationsController = async (
  req: Request<ParamsDictionary, any, GetAllConversationsParams>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page } = req.query
  const { allConversations, total } = await conversationServices.getAllConversations({
    user_id,
    limit: Number(limit),
    page: Number(page)
  })
  res.json({
    message: CONVERSATIONS_MESSAGE.GET_CONVERSATION_SUCCESSFULLY,
    result: allConversations,
    limit: Number(limit),
    page: Number(page),
    total_pages: Math.ceil(total / Number(limit))
  })
}

export const editMessageInConversationController = async (
  req: Request<ParamsDictionary, any, editMessageInConversationResBody>,
  res: Response
) => {
  const { messages_id } = req.params
  const { content } = req.body
  console.log(content)

  if (!content) {
    res.status(400).json({ message: CONVERSATIONS_MESSAGE.CONTENT_IS_REQUIRED })
  }
  const result = await conversationServices.editConversation({ messages_id, content })
  res.json({ message: CONVERSATIONS_MESSAGE.EDIT_CONVERSATION_SUCCESSFULLY, result })
}
export const deleteMessageInConversationController = async (
  req: Request<ParamsDictionary, any, deleteMessageInConversationResBody>,
  res: Response
) => {
  const { messages_id } = req.params
  const result = await conversationServices.deleteMessageInConversation({ messages_id })
  res.json({ message: CONVERSATIONS_MESSAGE.DELETE_MESSAGE_IN_CONVERSATION_SUCCESSFULLY, result })
}
export const setEmojiMessageInConversationController = async (
  req: Request<ParamsDictionary, any, setEmojiMessageInConversationResBody>,
  res: Response
) => {
  const { messages_id } = req.params
  const { emoji } = req.body
  const result = await conversationServices.setEmojiMessageInConversation({ messages_id, emoji: Number(emoji) })
  res.json({ message: CONVERSATIONS_MESSAGE.SET_EMOJI_MESSAGE_IN_CONVERSATION_SUCCESSFULLY, result })
}
