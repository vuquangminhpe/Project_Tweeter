import { LoginResponse } from '@/types/Reponse.type'
import { RegisterType, User } from '@/types/User.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const apiUser = {
  getUserProfile: () => http.get<SuccessResponse<User>>('/users/me'),
  registerUser: (body: RegisterType[]) => http.post<SuccessResponse<User>>('/users/register', body),
  loginUser: (body: Pick<RegisterType, 'email' | 'password'>[]) =>
    http.post<SuccessResponse<LoginResponse>>('/users/login', body),
  getProfile: () => http.get<SuccessResponse<User>>('/users/me'),
  getFollowing: () => http.get<SuccessResponse<User[]>>('/users/me/following'),
  getFollowers: () => http.get<SuccessResponse<User[]>>('/users/me/followers'),
  getProfileByUserName: (username: string) => http.get<SuccessResponse<User>>(`/users/${username}`)
}

export default apiUser
