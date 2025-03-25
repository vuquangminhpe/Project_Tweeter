import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { AccountStatus, TokenType, UserVerifyStatus } from '../constants/enums'
import { RegisterReqBody, UpdateMeReqBody } from '../models/request/User.request'
import User from '../models/schemas/User.schema'
import { hashPassword } from '../utils/crypto'
import { signToken } from '../utils/jwt'
import databaseService from './database.services'
import { ObjectId } from 'bson'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import Follower from '~/models/schemas/Follower.schema'
import axios from 'axios'
import { config } from 'dotenv'
import { verifyEmail as sendVerifyEmail, verifyEmail, verifyForgotPassword } from 'sendmail'
import { envConfig } from '~/constants/config'
import valkeyService from './valkey.services'

config()
class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.AccessToken,
        verify
      },
      privateKey: envConfig.privateKey_access_token as string,
      optional: {
        expiresIn: envConfig.expiresIn_access_token
      }
    })
  }
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.RefreshToken,
        verify
      },
      privateKey: envConfig.privateKey_refresh_token as string,

      optional: {
        expiresIn: envConfig.expiresIn_refresh_token
      }
    })
  }
  private forgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: envConfig.secretOnPublicKey_Forgot as string,

      optional: {
        expiresIn: envConfig.expiresIn_forgot_token
      }
    })
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: envConfig.secretOnPublicKey_Email as string,

      optional: {
        expiresIn: envConfig.expiresIn_email_token
      }
    })
  }

  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        typeAccount: AccountStatus.FREE,
        count_type_account: 0,
        email_verify_token: email_verify_token,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    const expiryInSeconds = envConfig.token_expiry_seconds || 604800
    await valkeyService.storeRefreshToken(user_id.toString(), refresh_token, expiryInSeconds)

    await sendVerifyEmail(payload.email, email_verify_token)

    return {
      access_token,
      refresh_token
    }
  }
  async refreshToken(user_id: string, verify: UserVerifyStatus, refresh_token: string) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify })
    ])

    await valkeyService.deleteRefreshToken(refresh_token)

    const expiryInSeconds = envConfig.token_expiry_seconds || 604800
    await valkeyService.storeRefreshToken(user_id, new_refresh_token, expiryInSeconds)

    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
  async checkUsersExists(email: string) {
    const result = await databaseService.users.findOne({
      email: email
    })
    return Boolean(result)
  }
  private async getOauthGoogleToken(code: string) {
    const body = new URLSearchParams({
      code,
      client_id: envConfig.client_id!,
      client_secret: envConfig.client_secret!,
      redirect_uri: envConfig.redirect_uri!,
      grant_type: 'authorization_code'
    })

    const { data } = await axios.post('https://oauth2.googleapis.com/token', body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }
  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })

    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      family_name: string
      picture: string
    }
  }
  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const user = await databaseService.users.findOne({ email: userInfo.email })
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })

      const expiryInSeconds = envConfig.token_expiry_seconds || 604800
      await valkeyService.storeRefreshToken(user._id.toString(), refresh_token, expiryInSeconds)

      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify
      }
    } else {
      const password = crypto.randomUUID()
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password
      })
      return {
        ...data,
        newUser: 1,
        verify: UserVerifyStatus.Unverified
      }
    }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: verify
    })

    const expiryInSeconds = envConfig.token_expiry_seconds || 604800
    await valkeyService.storeRefreshToken(user_id, refresh_token, expiryInSeconds)

    return {
      access_token,
      refresh_token
    }
  }
  async logout(refresh_token: string) {
    await valkeyService.deleteRefreshToken(refresh_token)

    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(user_id: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })

    const expiryInSeconds = envConfig.token_expiry_seconds || 604800
    await valkeyService.storeRefreshToken(user_id, refresh_token, expiryInSeconds)

    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.forgotPasswordToken({ user_id, verify: verify })
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    verifyForgotPassword(user?.email as string, forgot_password_token)
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(payload as UpdateMeReqBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return user
  }
  async getProfileByUserName(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }
  async getProfileByUserId(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }
  async follow(user_id: string, followed_user_id: string) {
    const user_follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (user_follower) {
      return {
        message: USERS_MESSAGES.CANNOT_FOLLOW_DUPLICATES
      }
    }
    await databaseService.followers.insertOne(
      new Follower({ user_id: new ObjectId(user_id), followed_user_id: new ObjectId(followed_user_id) })
    )
    return {
      message: USERS_MESSAGES.FOLLOWER_SUCCESS
    }
  }
  async unFollow(user_id: string, followed_user_id: string) {
    const user_follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (!user_follower) {
      return {
        message: USERS_MESSAGES.NO_FOLLOW_USER
      }
    }
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: USERS_MESSAGES.UN_FOLLOWER_SUCCESS
    }
  }
  async getAllUsers(user_id: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit; // Tính số lượng bản ghi cần bỏ qua

      // Lấy danh sách những user đã follow
      const followedUsers = await databaseService.followers
        .find({ user_id: new ObjectId(user_id) })
        .toArray();

      const followedUserIds = followedUsers.map((f) => new ObjectId(f.followed_user_id));

      // Tìm những user chưa được follow
      const query: any = followedUserIds.length > 0
        ? { _id: { $nin: followedUserIds, $ne: new ObjectId(user_id) } } // Loại bỏ cả bản thân người dùng
        : { _id: { $ne: new ObjectId(user_id) } }; // Nếu chưa follow ai, lấy tất cả trừ bản thân

      const users = await databaseService.users
        .find(query, {
          projection: { _id: 1, name: 1, username: 1, email: 1, avatar: 1 }
        })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Đếm tổng số user chưa follow
      const totalUsers = await databaseService.users.countDocuments(query);

      return {
        users,
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit)
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  async searchUsersByName(name: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      // Tìm kiếm người dùng với name khớp (không phân biệt hoa thường)
      const users = await databaseService.users
        .find(
          {
            name: { $regex: name, $options: 'i' }, // Tìm kiếm không phân biệt hoa thường
          },
          {
            projection: {
              _id: 1,
              name: 1,
              username: 1,
              email: 1,
              avatar: 1,
            },
          }
        )
        .skip(skip)
        .limit(limit)
        .toArray();

      // Đếm tổng số người dùng khớp với tìm kiếm
      const totalUsers = await databaseService.users.countDocuments({
        name: { $regex: name, $options: 'i' },
      });

      return {
        users,
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      };
    } catch (error) {
      console.error('Error searching users:', error);
      return { users: [], total: 0, page, limit, totalPages: 0 };
    }
  }
  
  async getFollowing(user_id: string) {
    // Lấy danh sách following từ collection followers
    const followers = await databaseService.followers
      .find({ user_id: new ObjectId(user_id) })
      .toArray();

    // Lấy danh sách followed_user_id từ followers
    const followerIds = followers.map((f) => new ObjectId(f.followed_user_id));

    // Lấy thông tin chi tiết của từng người dùng từ collection users
    const followerDetails = await databaseService.users
      .find(
        { _id: { $in: followerIds } },
        { projection: { _id: 1, name: 1, username: 1, email: 1, avatar: 1 } } // Chỉ lấy các trường cần thiết
      )
      .toArray();

    // Tạo một Map để dễ dàng truy vấn thông tin của từng người dùng
    const followerMap = new Map(
      followerDetails.map((user) => [
        user._id.toString(),
        {
          _id: user._id.toString(),
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar || null,
        },
      ])
    );

    // Gán thông tin đúng vào từng follower
    const result = followers.map((follower) => ({
      _id: follower._id.toString(),
      user_id: follower.user_id.toString(),
      followed_user_id: follower.followed_user_id.toString(),
      created_at: follower.created_at,
      followingDetails: followerMap.get(follower.followed_user_id.toString()) || null,
    }));

    return result; // Trả về trực tiếp mảng result
  }
  async getFollowers(user_id: string) {
    const result = await databaseService.followers.find({ followed_user_id: new ObjectId(user_id) }).toArray()
    return result
  }
  async changePassword(user_id: string, new_password: string) {
    const changePassword = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return changePassword
  }
}

const usersService = new UserService()
export default usersService
