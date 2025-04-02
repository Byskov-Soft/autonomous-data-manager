import { MongoClient, Db } from 'mongodb'
import { getEnv } from './env.js'

// Singleton instance of the database connection
let dbInstance: Db | null = null
let client: MongoClient | null = null

/**
 * Creates a MongoDB connection if one doesn't exist, or returns the existing connection
 * @returns A Promise that resolves to the database instance
 */
export async function useDatabase(): Promise<Db> {
  // If we already have a database instance, return it
  if (dbInstance) {
    return dbInstance
  }

  // Get environment variables
  const env = getEnv()

  try {
    // Create a new MongoDB client
    client = new MongoClient(env.MONGO_URI, {
      auth: {
        username: env.MONGO_USER,
        password: env.MONGO_PASSWORD
      }
    })

    // Connect to the MongoDB server
    await client.connect()

    // Get the database instance
    dbInstance = client.db(env.MONGO_DB_NAME)

    // Handle application shutdown
    process.on('SIGINT', closeConnection)
    process.on('SIGTERM', closeConnection)

    return dbInstance
  } catch (error) {
    throw error
  }
}

/**
 * Closes the MongoDB connection
 */
async function closeConnection() {
  if (client) {
    try {
      await client.close()
      dbInstance = null
      client = null
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error)
    } finally {
      process.exit(0)
    }
  }
}
