import { type NextRequest, NextResponse } from "next/server"
import { EmployeeService } from "@/lib/services/employeeService"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!Array.isArray(data.employees) || data.employees.length === 0) {
      return NextResponse.json({ error: "No employees provided" }, { status: 400 })
    }

    const results = {
      total: data.employees.length,
      successful: 0,
      failed: 0,
      errors: [] as { email: string; error: string }[],
    }

    // Process each employee
    for (const employeeData of data.employees) {
      try {
        await EmployeeService.createEmployee(employeeData)
        results.successful++
      } catch (error: any) {
        results.failed++
        results.errors.push({
          email: employeeData.email,
          error: error.message || "Unknown error occurred",
        })
      }
    }

    return NextResponse.json(results, { status: 201 })
  } catch (error: any) {
    console.error("Error in bulk import:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
