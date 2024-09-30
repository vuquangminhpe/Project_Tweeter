import { TokenType, UserVerifyStatus } from '../constants/enums'
import { RegisterReqBody } from '../models/request/User.request'
import User from '../models/schemas/User.schema'
import { hashPassword } from '../utils/crypto'
import { signToken } from '../utils/jwt'
import databaseService from './database.services'

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.AccessToken
      },
      optional: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.RefreshToken
      },
      optional: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({ ...payload, password: hashPassword(payload.password), date_of_birth: new Date(payload.date_of_birth) })
    )
    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    return {
      access_token,
      refresh_token
    }
  }
  async checkEmailExits(email: string) {
    const result = await databaseService.users.findOne({ email })
    console.log(email)
    console.log(result)

    return Boolean(result)
  }
}

const usersService = new UserService()
export default usersService
