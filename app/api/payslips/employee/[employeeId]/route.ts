import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PayslipService } from "@/lib/services/payslipService"

export async function GET(request: NextRequest, { params }: { params: { employeeId: string } }) {
  try {
    // Store the employeeId in a variable first
    const employeeId = params.employeeId

    // Then use the variable
    const payslips = await PayslipService.getPayslipsByEmployee(employeeId)
    return NextResponse.json(payslips)
  } catch (error: any) {
    console.error("Error fetching employee payslips:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
