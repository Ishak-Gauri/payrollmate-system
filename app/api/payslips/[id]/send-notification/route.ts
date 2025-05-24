import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PayslipService } from "@/lib/services/payslipService"
import { EmployeeService } from "@/lib/services/employeeService"
import { NotificationService } from "@/lib/services/notificationService"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { includePDF = true } = await request.json()
    const payslipId = params.id

    // Get payslip
    const payslips = await PayslipService.getAllPayslips()
    const payslip = payslips.find((p) => p.payslipId === payslipId)

    if (!payslip) {
      return NextResponse.json({ error: "Payslip not found" }, { status: 404 })
    }

    // Get employee
    const employee = await EmployeeService.getEmployeeById(payslip.employeeId)
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Send notification
    const success = await NotificationService.sendPayslipNotification(employee, payslip, includePDF)

    if (success) {
      return NextResponse.json({
        message: "Notification sent successfully",
        emailSent: true,
      })
    } else {
      return NextResponse.json(
        {
          error: "Failed to send notification",
          emailSent: false,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error sending payslip notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
