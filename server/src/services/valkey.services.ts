import { createClient } from 'redis'
import { envConfig } from '../constants/config'
import { ObjectId } from 'bson'

class ValkeyService {
  private client: ReturnType<typeof createClient>
  private static instance: ValkeyService
  private connectionPromise: Promise<void> | null = null
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:'
  private readonly TOKEN_TO_USER_PREFIX = 'token_to_user:'

  private constructor() {
    this.client = createClient({
      url: process.env.VALKEY_URL || 'redis://localhost:6379',
      socket: {
        tls: process.env.VALKEY_URL?.startsWith('rediss://'),
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error('Max retries reached')
          return Math.min(retries * 500, 2000)
        },
        connectTimeout: 10000 // 10 giây
      }
    })

    this.client.on('error', (err) => console.error('Redis error:', err))
  }

  public static getInstance(): ValkeyService {
    if (!ValkeyService.instance) {
      ValkeyService.instance = new ValkeyService()
    }
    return ValkeyService.instance
  }

  async connect(): Promise<void> {
    if (!this.connectionPromise) {
      this.connectionPromise = this.client
        .connect()
        .then(() => console.log('Redis connected!'))
        .catch((err) => {
          console.error('Redis connection failed:', err)
          this.connectionPromise = null
          throw err
        })
    }
    return this.connectionPromise
  }

  // Phương thức mới để đảm bảo kết nối trước khi thực hiện thao tác
  private async ensureConnected(): Promise<void> {
    if (!this.client.isOpen) {
      await this.connect()
    }
  }

  async storeRefreshToken(user_id: string, token: string, expiresInSec: number) {
    await this.ensureConnected()
    const tokenKey = `${this.TOKEN_TO_USER_PREFIX}${token}`
    await this.client.setEx(tokenKey, expiresInSec, user_id)
    const userKey = `${this.REFRESH_TOKEN_PREFIX}${user_id}`
    await this.client.sAdd(userKey, token)
    console.log(`Stored refresh token for user_id: ${user_id}`)
  }

  async getUserIdFromToken(token: string): Promise<string | null> {
    await this.ensureConnected()
    const tokenKey = `${this.TOKEN_TO_USER_PREFIX}${token}`
    return await this.client.get(tokenKey)
  }

  async getRefreshTokensForUser(user_id: string): Promise<string[]> {
    await this.ensureConnected()
    const userKey = `${this.REFRESH_TOKEN_PREFIX}${user_id}`
    return await this.client.sMembers(userKey)
  }

  async deleteRefreshToken(token: string): Promise<boolean> {
    await this.ensureConnected()
    const tokenKey = `${this.TOKEN_TO_USER_PREFIX}${token}`
    const user_id = await this.client.get(tokenKey)

    if (!user_id) return false

    await this.client.del(tokenKey)
    const userKey = `${this.REFRESH_TOKEN_PREFIX}${user_id}`
    await this.client.sRem(userKey, token)

    console.log(`Deleted refresh token for user_id: ${user_id}`)
    return true
  }

  async deleteAllRefreshTokensForUser(user_id: string): Promise<void> {
    await this.ensureConnected()
    const userKey = `${this.REFRESH_TOKEN_PREFIX}${user_id}`
    const tokens = await this.client.sMembers(userKey)

    const tokenKeyPromises = tokens.map((token) => this.client.del(`${this.TOKEN_TO_USER_PREFIX}${token}`))

    await Promise.all([...tokenKeyPromises, this.client.del(userKey)])

    console.log(`Deleted all refresh tokens for user_id: ${user_id}`)
  }

  async tokenExists(token: string): Promise<boolean> {
    await this.ensureConnected()
    const tokenKey = `${this.TOKEN_TO_USER_PREFIX}${token}`
    return (await this.client.exists(tokenKey)) === 1
  }
}

const valkeyService = ValkeyService.getInstance()
export default valkeyService
