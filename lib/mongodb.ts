import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
// Add more detailed options for troubleshooting
const options = {
  connectTimeoutMS: 10000, // Increase timeout to 10 seconds
  socketTimeoutMS: 45000, // Increase socket timeout
  family: 4, // Force IPv4
  serverSelectionTimeoutMS: 5000, // Faster server selection timeout for quicker error feedback
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log("Creating new MongoDB client connection...")
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error("MongoDB connection error details:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      })
      throw err
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise
    // Extract database name from connection string or use default
    let dbName = "payrollmate"

    if (process.env.MONGODB_URI) {
      const uriParts = process.env.MONGODB_URI.split("/")
      if (uriParts.length > 3) {
        const lastPart = uriParts[uriParts.length - 1]
        dbName = lastPart.split("?")[0] || dbName
      }
    }

    console.log(`Connecting to database: ${dbName}`)
    return client.db(dbName)
  } catch (error) {
    console.error("Error in getDatabase:", error)
    throw error
  }
}
