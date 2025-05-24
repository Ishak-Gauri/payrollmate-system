import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { z } from "zod"
import * as bcryptjs from "bcryptjs"

// Define validation schema
const resetPasswordSchema = z.object({
  token: z.string(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 })
    }

    const { token, email, password } = result.data
    const lowercaseEmail = email.toLowerCase()

    const db = await getDatabase()

    // Find valid reset token
    const resetRequest = await db.collection("password_resets").findOne({
      email: lowercaseEmail,
      token,
      expires: { $gt: new Date() },
    })

    if (!resetRequest) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Update user's password
    const updateResult = await db.collection("users").updateOne(
      { email: lowercaseEmail },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete used token
    await db.collection("password_resets").deleteOne({ _id: resetRequest._id })

    return NextResponse.json({ message: "Password reset successful" }, { status: 200 })
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Failed to reset password", details: error.message }, { status: 500 })
  }
}
