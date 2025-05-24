import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import Stripe from "stripe"
import { PayslipService } from "@/lib/services/payslipService"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") || ""

  let event: Stripe.Event

  try {
    // If webhook secret is available, verify the signature
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } else {
      // If no webhook secret is available, parse the event directly
      // Note: This is less secure but will work without the webhook secret
      event = JSON.parse(body) as Stripe.Event
      console.log("Warning: Processing webhook without signature verification")
    }
  } catch (err: any) {
    console.error(`Webhook processing failed: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "transfer.created":
        const transferCreated = event.data.object as Stripe.Transfer
        console.log(`Transfer created: ${transferCreated.id} for ${transferCreated.amount / 100}`)

        // Update payslip status if metadata contains payslipId
        if (transferCreated.metadata?.payslipId) {
          await PayslipService.updatePayslipStatus(transferCreated.metadata.payslipId, "Paid", transferCreated.id)
        }
        break

      case "transfer.paid":
        const transferPaid = event.data.object as Stripe.Transfer
        console.log(`Transfer paid: ${transferPaid.id}`)

        // Log successful payment
        if (transferPaid.metadata?.employeeId && transferPaid.metadata?.payrollId) {
          console.log(
            `Payment successful for employee ${transferPaid.metadata.employeeId} in payroll ${transferPaid.metadata.payrollId}`,
          )
        }
        break

      case "transfer.failed":
        const transferFailed = event.data.object as Stripe.Transfer
        console.log(`Transfer failed: ${transferFailed.id}`)

        // Update payslip status to failed
        if (transferFailed.metadata?.payslipId) {
          await PayslipService.updatePayslipStatus(transferFailed.metadata.payslipId, "Failed")
        }

        // You might want to send notifications here
        break

      case "account.updated":
        const account = event.data.object as Stripe.Account
        console.log(`Account updated: ${account.id}`)

        // Update employee's Stripe account status in database if needed
        break

      case "payout.created":
        const payoutCreated = event.data.object as Stripe.Payout
        console.log(`Payout created: ${payoutCreated.id} for ${payoutCreated.amount / 100}`)
        break

      case "payout.paid":
        const payoutPaid = event.data.object as Stripe.Payout
        console.log(`Payout paid: ${payoutPaid.id}`)
        break

      case "payout.failed":
        const payoutFailed = event.data.object as Stripe.Payout
        console.log(`Payout failed: ${payoutFailed.id}`)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
