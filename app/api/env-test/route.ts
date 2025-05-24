import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    mongodbUri: process.env.MONGODB_URI ? "Set (masked for security)" : "Not set",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ? "Set (masked for security)" : "Not set",
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "Not set",
    nodeEnv: process.env.NODE_ENV || "Not set",
  })
}
