import { RegisterType, User } from '@/types/User.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const apiUser = {
  getUserProfile: () => http.get<SuccessResponse<User>>('/users/me'),
  registerUser: (body: RegisterType[]) => http.post<SuccessResponse<User>>('/users/register', body)
}

export default apiUser
