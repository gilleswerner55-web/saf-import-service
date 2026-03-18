import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create database connection
// Uses DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL!

// For local development, use postgres-js
// For production (Neon), this same driver works since Neon supports the postgres protocol
const client = postgres(connectionString)

export const db = drizzle(client, { schema })

// Re-export schema for convenience
export * from './schema'
