import { Request, Response } from 'express'
import { CONVERSATIONS_MESSAGE } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import { GetAllConversationsParams, GetConversationsParams } from '~/models/request/Conversations.requests'
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
