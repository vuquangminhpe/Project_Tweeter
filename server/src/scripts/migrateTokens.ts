import databaseService from '../services/database.services'
import valkeyService from '../services/valkey.services'
import { envConfig } from '../constants/config'

async function migrateTokens() {
  console.log('Starting migration of refresh tokens from MongoDB to Valkey...')

  try {
    await databaseService.connect()
    console.log('Connected to MongoDB')

    const tokens = await databaseService.refreshToken.find({}).toArray()
    console.log(`Found ${tokens.length} tokens to migrate`)

    for (const token of tokens) {
      try {
        await valkeyService.storeRefreshToken(
          token.user_id.toString(),
          token.token,
          envConfig.token_expiry_seconds || 604800
        )
        console.log(`Migrated token for user: ${token.user_id}`)
      } catch (err) {
        console.error(`Failed to migrate token for user ${token.user_id}:`, err)
      }
    }

    console.log('Migration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    process.exit(0)
  }
}

migrateTokens()
