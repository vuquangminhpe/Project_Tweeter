export interface ResponseAI {
  _id: string
  sender_id: string
  receive_id: string
  content: string
  createdAt: string
  sender_info_username: string
  pagination: Pagination
}
interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}
