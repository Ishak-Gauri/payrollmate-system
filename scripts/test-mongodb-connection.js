// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })
const { MongoClient } = require("mongodb")

async function main() {
  console.log("MongoDB Connection Test")
  console.log("======================")

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error("Error: MONGODB_URI environment variable is not set")
    process.exit(1)
  }

  // Mask the connection string for security in logs
  const maskedUri = process.env.MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, "mongodb$1://$2:****@")
  console.log(`Connection string: ${maskedUri}`)

  // Parse the connection string to extract components
  try {
    const url = new URL(process.env.MONGODB_URI)
    console.log(`Protocol: ${url.protocol}`)
    console.log(`Hostname: ${url.hostname}`)
    console.log(`Database: ${url.pathname.substring(1) || "None specified"}`)
    console.log(`Username: ${url.username || "None"}`)
    console.log(`Password: ${url.password ? "****" : "None"}`)
  } catch (err) {
    console.error("Error parsing connection string:", err.message)
  }

  // Try to connect
  console.log("\nAttempting to connect...")
  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
  })

  try {
    await client.connect()
    console.log("✅ Connected successfully to MongoDB!")

    // Get database info
    const db = client.db()
    console.log(`Database name: ${db.databaseName}`)

    // List collections
    const collections = await db.listCollections().toArray()
    if (collections.length === 0) {
      console.log("No collections found in this database")
    } else {
      console.log("Collections:")
      collections.forEach((coll) => {
        console.log(`- ${coll.name}`)
      })
    }

    // Get server info
    const serverInfo = await db.admin().serverInfo()
    console.log(`MongoDB server version: ${serverInfo.version}`)
  } catch (err) {
    console.error("❌ Connection failed:", err)

    // More detailed error analysis
    if (err.name === "MongoServerSelectionError") {
      console.error("\nThis is a server selection error, which often means:")
      console.error("1. The connection string might be incorrect")
      console.error("2. Your IP might not be whitelisted in MongoDB Atlas")
      console.error("3. The MongoDB server might be down or unreachable")
      console.error("4. There might be network issues preventing the connection")

      if (err.message.includes("getaddrinfo ENOTFOUND")) {
        console.error("\nThe hostname could not be resolved. Check your connection string.")
      }

      if (err.message.includes("querySrv ENOTFOUND")) {
        console.error("\nDNS SRV lookup failed. Try using a standard connection string instead of SRV.")
        console.error("Example: mongodb://user:pass@host1:port,host2:port/dbname")
      }
    }
  } finally {
    await client.close()
    console.log("Connection closed")
  }
}

main().catch(console.error)
