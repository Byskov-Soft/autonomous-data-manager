import { z } from 'zod'

// Define the schema for environment variables
export const EnvVars = z.object({
  // Misc
  LARGE_TEXT_THRESHOLD: z.coerce.number().default(500),

  // MongoDB connection details
  MONGO_URI: z.string().url(),
  MONGO_DB_NAME: z.string(),
  MONGO_USER: z.string(),
  MONGO_PASSWORD: z.string(),

  // Optional variables with defaults
  COLLECTION_VALIDATION: z.enum(['on', 'off']).default('on'),

  // Server run mode
  RUN_MODE: z.enum(['command', 'sse']).default('command'),

  // HTTP server settings (only needed for SSE mode)
  SSE_MODE_PORT: z.coerce.number().default(3000),
  SSE_MODE_HOST: z.string().default('localhost')
})

// Type for the parsed environment
export type EnvVars = z.infer<typeof EnvVars>

// Parse and validate environment variables
export function getEnv(): EnvVars {
  try {
    return EnvVars.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    process.exit(1)
  }
}
