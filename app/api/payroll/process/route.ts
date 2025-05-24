import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PayrollService } from "@/lib/services/payrollService"
import { EmployeeService } from "@/lib/services/employeeService"
import { PayslipService } from "@/lib/services/payslipService"
import { NotificationService } from "@/lib/services/notificationService"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { payrollId, sendNotifications = true } = await request.json()

    if (!payrollId) {
      return NextResponse.json({ error: "Missing payrollId" }, { status: 400 })
    }

    // Get payroll details
    const payroll = await PayrollService.getPayrollById(payrollId)
    if (!payroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 })
    }

    // Update payroll status to processing
    await PayrollService.updatePayrollStatus(payrollId, "Processing")

    // Get all active employees
    const employees = await EmployeeService.getAllEmployees({ status: "Active" })

    const results = await Promise.all(
      employees.map(async (employee) => {
        try {
          // Create payslip
          const payslip = await PayslipService.createPayslip(employee, payroll.period, payroll.date)

          // Process Stripe payment if employee has Stripe account
          if (employee.stripeAccountId) {
            const transfer = await stripe.transfers.create({
              amount: Math.round(payslip.netAmount * 100), // Convert to cents
              currency: "usd",
              destination: employee.stripeAccountId,
              transfer_group: payrollId,
              metadata: {
                employeeId: employee.employeeId,
                payrollId: payrollId,
                payslipId: payslip.payslipId,
              },
            })

            // Update payslip with payment info
            await PayslipService.updatePayslipStatus(payslip.payslipId, "Paid", transfer.id)

            // Send email notification if enabled
            if (sendNotifications) {
              await NotificationService.sendPayslipNotification(employee, payslip, true)
            }

            return {
              employeeId: employee.employeeId,
              status: "success",
              transferId: transfer.id,
              amount: payslip.netAmount,
              payslipId: payslip.payslipId,
              emailSent: sendNotifications,
            }
          } else {
            // Send email notification even if no payment processed
            if (sendNotifications) {
              await NotificationService.sendPayslipNotification(employee, payslip, true)
            }

            return {
              employeeId: employee.employeeId,
              status: "no_stripe_account",
              amount: payslip.netAmount,
              payslipId: payslip.payslipId,
              emailSent: sendNotifications,
            }
          }
        } catch (error: any) {
          console.error(`Error processing payment for employee ${employee.employeeId}:`, error)
          return {
            employeeId: employee.employeeId,
            status: "failed",
            error: error.message,
            emailSent: false,
          }
        }
      }),
    )

    // Update payroll status based on results
    const successful = results.filter((r) => r.status === "success").length
    const failed = results.filter((r) => r.status === "failed").length

    const finalStatus = failed === 0 ? "Completed" : "Failed"
    await PayrollService.updatePayrollStatus(payrollId, finalStatus)

    // Send summary notification to admin
    if (sendNotifications) {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@payrollmate.com"
      await NotificationService.sendPayrollSummaryNotification(adminEmail, payrollId, {
        total: employees.length,
        successful,
        failed,
      })
    }

    return NextResponse.json({
      success: true,
      payrollId,
      results,
      summary: {
        total: employees.length,
        successful,
        failed,
        noStripeAccount: results.filter((r) => r.status === "no_stripe_account").length,
        emailsSent: results.filter((r) => r.emailSent).length,
      },
    })
  } catch (error: any) {
    console.error("Error processing payroll:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
