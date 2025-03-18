export interface ResponseAI {
  conversations: conversations[]
  pagination: Pagination
}
export interface conversations {
  _id: string
  sender_id: string
  receive_id: string
  content: string
  createdAt: string
  sender_info_username: string
}
interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}
export interface dataParams {
  limit: number
  page: number
}
