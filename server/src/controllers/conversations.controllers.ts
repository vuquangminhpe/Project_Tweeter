import { Request, Response } from 'express'
import { CONVERSATIONS_MESSAGE } from '~/constants/messages'
import { GetConversationsParams } from '~/models/request/Conversations.requests'
import conversationServices from '~/services/conversations.services'
export const getConversationsByReceiverIdController = async (req: Request<GetConversationsParams>, res: Response) => {
  const { receiver_id } = req.params
  const { limit, page } = req.query
  const sender_id = req.decode_authorization?.user_id as string
  console.log(sender_id, receiver_id)

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
