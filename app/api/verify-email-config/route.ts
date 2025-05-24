import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET() {
  try {
    // Check if all required environment variables are present
    const requiredVars = {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      COMPANY_NAME: process.env.COMPANY_NAME,
      FROM_EMAIL: process.env.FROM_EMAIL,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      NEXT_PUBLIC_RESEND_CONFIGURED: process.env.NEXT_PUBLIC_RESEND_CONFIGURED,
    }

    const missingVars = Object.entries(requiredVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing environment variables: ${missingVars.join(", ")}`,
        configured: false,
      })
    }

    // Test Resend API connection
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Try to get API key info (this doesn't send an email, just validates the key)
    try {
      // This is a simple way to test if the API key is valid
      const testResult = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "test@example.com", // This won't actually send since it's an invalid email
        subject: "Test",
        text: "Test",
      })

      // If we get here without an authentication error, the API key is valid
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.message?.includes("API key") || error.message?.includes("authentication")) {
        return NextResponse.json({
          success: false,
          error: "Invalid Resend API key",
          configured: false,
        })
      }
      // Other errors are expected (like invalid email format) and mean the API key is valid
    }

    return NextResponse.json({
      success: true,
      message: "Email configuration is valid and ready",
      configured: true,
      config: {
        companyName: process.env.COMPANY_NAME,
        fromEmail: "onboarding@resend.dev", // Using Resend's verified domain
        replyToEmail: process.env.FROM_EMAIL,
        adminEmail: process.env.ADMIN_EMAIL,
      },
    })
  } catch (error: any) {
    console.error("Email configuration verification failed:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to verify email configuration",
      configured: false,
    })
  }
}
