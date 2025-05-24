import { NextResponse } from "next/server"
import clientPromise, { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    // Test the connection
    const client = await clientPromise
    const db = await getDatabase()

    // Get server info
    const serverInfo = await client.db().admin().serverInfo()

    // Get collection names
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((col) => col.name)

    return NextResponse.json({
      connected: true,
      serverVersion: serverInfo.version,
      database: db.databaseName,
      collections: collectionNames,
      message: "Successfully connected to MongoDB!",
    })
  } catch (error: any) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json(
      {
        connected: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
