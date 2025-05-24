import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PayslipService } from "@/lib/services/payslipService"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      period: searchParams.get("period") || undefined,
      employeeId: searchParams.get("employeeId") || undefined,
      status: searchParams.get("status") || undefined,
    }

    const payslips = await PayslipService.getAllPayslips(filters)
    return NextResponse.json(payslips)
  } catch (error: any) {
    console.error("Error fetching payslips:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
