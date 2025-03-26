import { createClient } from 'redis'
import { envConfig } from '../constants/config'
import { ObjectId } from 'bson'

class ValkeyService {
  private client
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:'
  private readonly TOKEN_TO_USER_PREFIX = 'token_to_user:'

  constructor() {
    this.client = createClient({
      url: envConfig.valkey_url || 'redis://localhost:6380 '
    })

    this.client.on('error', (err) => console.log('Valkey Client Error', err))
    this.connect()
  }

  async connect() {
    try {
      await this.client.connect()
      console.log('Connected to Valkey successfully!')
    } catch (error) {
      console.error('Failed to connect to Valkey:', error)
    }
  }

  async storeRefreshToken(user_id: string, token: string, expiresInSec: number) {
    const tokenKey = `${this.TOKEN_TO_USER_PREFIX}${token}`
    await this.client.setEx(tokenKey, expiresInSec, user_id)
    const userKey = `${this.REFRESH_TOKEN_PREFIX}${user_id}`
    await this.client.sAdd(userKey, token)
    console.log(`Stored refresh token for user_id: ${user_id}`)
  }

  async getUserIdFromToken(token: string): Promise<string | null> {
    const tokenKey = `${this.TOKEN_TO_USER_PREFIX}${token}`
    return await this.client.get(tokenKey)
  }

  async getRefreshTokensForUser(user_id: string): Promise<string[]> {
    const userKey = `${this.REFRESH_TOKEN_PREFIX}${user_id}`
    return await this.client.sMembers(userKey)
  }

  async deleteRefreshToken(token: string): Promise<boolean> {
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
    const userKey = `${this.REFRESH_TOKEN_PREFIX}${user_id}`
    const tokens = await this.client.sMembers(userKey)

    const tokenKeyPromises = tokens.map((token) => this.client.del(`${this.TOKEN_TO_USER_PREFIX}${token}`))

    await Promise.all([...tokenKeyPromises, this.client.del(userKey)])

    console.log(`Deleted all refresh tokens for user_id: ${user_id}`)
  }

  async tokenExists(token: string): Promise<boolean> {
    const tokenKey = `${this.TOKEN_TO_USER_PREFIX}${token}`
    return (await this.client.exists(tokenKey)) === 1
  }
}

const valkeyService = new ValkeyService()
export default valkeyService
