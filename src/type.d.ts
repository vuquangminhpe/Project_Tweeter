import { Request } from 'express'
import User from './models/schemas/User.schema'
import { TokenPayload } from './models/request/User.request'

declare module 'express' {
  interface Request {
    user?: User
    decode_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
  }
}
