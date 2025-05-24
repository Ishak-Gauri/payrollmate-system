import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { EmployeeService } from "@/lib/services/employeeService"
import { NotificationService } from "@/lib/services/notificationService"
import type { CreateEmployeeData } from "@/lib/models/employee"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department") || undefined
    const status = searchParams.get("status") as "Active" | "Inactive" | "On Leave" | undefined
    const search = searchParams.get("search") || undefined

    const employees = await EmployeeService.getAllEmployees({
      department,
      status,
      search,
    })

    return NextResponse.json({ employees })
  } catch (error: any) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateEmployeeData & { sendWelcomeEmail?: boolean } = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.department || !data.position || !data.salary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if employee with email already exists
    const existingEmployee = await EmployeeService.getEmployeeByEmail(data.email)
    if (existingEmployee) {
      return NextResponse.json({ error: "Employee with this email already exists" }, { status: 409 })
    }

    const { sendWelcomeEmail = true, ...employeeData } = data
    const employee = await EmployeeService.createEmployee(employeeData)

    // Send welcome email if requested
    if (sendWelcomeEmail) {
      try {
        await NotificationService.sendWelcomeNotification(employee)
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
        // Don't fail the employee creation if email fails
      }
    }

    return NextResponse.json(
      {
        employee,
        message: "Employee created successfully",
        welcomeEmailSent: sendWelcomeEmail,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
