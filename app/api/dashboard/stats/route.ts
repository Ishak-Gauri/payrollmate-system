import { NextResponse } from "next/server"
import { EmployeeService } from "@/lib/services/employeeService"
import { PayrollService } from "@/lib/services/payrollService"

export async function GET() {
  try {
    const [employeeStats, payrollStats] = await Promise.all([
      EmployeeService.getEmployeeStats(),
      PayrollService.getPayrollStats(),
    ])

    return NextResponse.json({
      employees: employeeStats,
      payroll: payrollStats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
