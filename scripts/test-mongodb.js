// Simple script to test MongoDB connection
require("dotenv").config({ path: ".env.local" })
const { MongoClient } = require("mongodb")

async function testConnection() {
  console.log("Testing MongoDB connection...")
  console.log(`Connection string: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`)

  const options = {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
  }

  const client = new MongoClient(process.env.MONGODB_URI, options)

  try {
    console.log("Attempting to connect...")
    await client.connect()
    console.log("Connected successfully!")

    const db = client.db()
    console.log(`Connected to database: ${db.databaseName}`)

    const collections = await db.listCollections().toArray()
    console.log(`Collections: ${collections.map((c) => c.name).join(", ")}`)

    const serverInfo = await db.admin().serverInfo()
    console.log(`MongoDB server version: ${serverInfo.version}`)

    return true
  } catch (error) {
    console.error("Connection failed:", error)
    return false
  } finally {
    await client.close()
    console.log("Connection closed")
  }
}

// Run the test
testConnection().then((success) => {
  console.log(`Test ${success ? "PASSED" : "FAILED"}`)
  process.exit(success ? 0 : 1)
})
