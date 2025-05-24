import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { randomBytes } from "crypto"
import { z } from "zod"
import nodemailer from "nodemailer"

// Define validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// For demo purposes - in production, use a real email service
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "ethereal.user@ethereal.email", // replace with actual credentials
    pass: "ethereal.password", // replace with actual credentials
  },
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 })
    }

    const { email } = result.data
    const lowercaseEmail = email.toLowerCase()

    // Check if user exists
    const db = await getDatabase()
    const user = await db.collection("users").findOne({ email: lowercaseEmail })

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return NextResponse.json(
        { message: "If your email is registered, you will receive a password reset link" },
        { status: 200 },
      )
    }

    // Generate reset token
    const token = randomBytes(32).toString("hex")
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // Token expires in 1 hour

    // Save token to database
    await db.collection("password_resets").insertOne({
      email: lowercaseEmail,
      token,
      expires,
      createdAt: new Date(),
    })

    // Send email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(lowercaseEmail)}`

    // In a real application, use a proper email template
    const mailOptions = {
      from: '"PayrollMate" <noreply@payrollmate.com>',
      to: lowercaseEmail,
      subject: "Reset Your Password",
      html: `
        <div>
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}">Reset Password</a>
        </div>
      `,
    }

    // In development, log the reset URL instead of sending an email
    console.log("Password reset URL:", resetUrl)

    // Uncomment to send actual email in production
    // await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { message: "If your email is registered, you will receive a password reset link" },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error processing forgot password request:", error)
    return NextResponse.json({ error: "Failed to process request", details: error.message }, { status: 500 })
  }
}
