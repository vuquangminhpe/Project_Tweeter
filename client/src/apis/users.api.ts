import { LoginResponse } from '@/types/Reponse.type'
import { RegisterType, User } from '@/types/User.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const apiUser = {
  getUserProfile: () => http.get<SuccessResponse<User>>('/users/me'),
  registerUser: (body: RegisterType[]) => http.post<SuccessResponse<User>>('/users/register', body),
  loginUser: (body: Pick<RegisterType, 'email' | 'password'>) =>
    http.post<SuccessResponse<LoginResponse>>('/users/login', body),
  getAllUsers: (page: number = 1, limit: number = 10) =>
    http.get<SuccessResponse<{ users: User[]; total: number; page: number; limit: number; totalPages: number }>>(
        `/users/all?page=${page}&limit=${limit}`
    ),
searchUsersByName: (name: string, page: number = 1, limit: number = 10) =>
    http.get<SuccessResponse<{ users: User[]; total: number; page: number; limit: number; totalPages: number }>>(
        `/users/search?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`
    ),
  getProfile: () => http.get<SuccessResponse<User>>('/users/me'),
  getFollowing: () => http.get<SuccessResponse<User[]>>('/users/me/following'),
  getFollowers: () => http.get<SuccessResponse<User[]>>('/users/me/followers'),
  followUser: (followed_user_id: string) =>
    http.post<SuccessResponse<{ message: string }>>('/users/follow', { followed_user_id }),
unfollowUser: (followed_user_id: string) =>
    http.delete<SuccessResponse<{ message: string }>>('/users/un-follow', { data: { followed_user_id } }),
  getProfileByUserName: (username: string) => http.get<SuccessResponse<User>>(`/users/${username}`),
  getProfileById: (user_id: string) => http.get<SuccessResponse<User>>(`/users/profile/${user_id}`)
}

export default apiUser
