import { NextResponse } from "next/server"
import * as bcryptjs from "bcryptjs"
const hash = bcryptjs.hash
import { getDatabase } from "@/lib/mongodb"
import { z } from "zod"

// Define validation schema
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const result = userSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 })
    }

    const { name, email, password } = result.data
    const lowercaseEmail = email.toLowerCase()

    // Check if user already exists
    const db = await getDatabase()
    const existingUser = await db.collection("users").findOne({ email: lowercaseEmail })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const result2 = await db.collection("users").insertOne({
      name,
      email: lowercaseEmail,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: result2.insertedId,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user", details: error.message }, { status: 500 })
  }
}
