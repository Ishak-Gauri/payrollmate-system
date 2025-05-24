import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PayrollService } from "@/lib/services/payrollService"

export async function GET(request: NextRequest) {
  try {
    const payrolls = await PayrollService.getAllPayrolls()
    return NextResponse.json(payrolls)
  } catch (error: any) {
    console.error("Error fetching payrolls:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { period, date } = await request.json()

    if (!period || !date) {
      return NextResponse.json({ error: "Missing required fields: period, date" }, { status: 400 })
    }

    const payroll = await PayrollService.createPayroll(period, new Date(date))
    return NextResponse.json(payroll, { status: 201 })
  } catch (error: any) {
    console.error("Error creating payroll:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
