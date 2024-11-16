import { Request, Response } from 'express'
import conversationServices from '~/services/conversations.services'
export const getConversationsByReceiverIdController = async (req: Request, res: Response) => {
  const { receiver_id } = req.params
  const sender_id = req.decode_authorization?.user_id as string
  console.log(sender_id, receiver_id)

  const result = await conversationServices.getConversations({ sender_id, receiver_id })
  res.json({
    message: 'Get conversation successfully',
    result
  })
}
