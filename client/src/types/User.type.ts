enum UserVerifyStatus {
  Unverified, // chưa xác thực
  Verified, // đã xác thực email
  Banned // bị khóa
}
export interface User {
  _id?: string
  name?: string
  email: string
  date_of_birth?: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string //
  forgot_password_token?: string
  verify?: UserVerifyStatus
  twitter_circle?: string[] //danh sách id của những người mà user này add vào circle
  bio?: string // optional
  location?: string // optional
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface Profile {
  _id: string
  username: string
}

export interface RegisterType {
  email: string
  password: string
  confirm_password: string
  name?: string
  date_of_birth: string
}
