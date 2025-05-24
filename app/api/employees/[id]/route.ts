import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { EmployeeService } from "@/lib/services/employeeService"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employee = await EmployeeService.getEmployeeById(params.id)

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Sanitize sensitive data
    const { bankDetails, ...sanitizedEmployee } = employee
    return NextResponse.json({
      ...sanitizedEmployee,
      bankDetails: {
        accountNumber: bankDetails.accountNumber.replace(/\d(?=\d{4})/g, "*"),
        bankName: bankDetails.bankName,
      },
    })
  } catch (error: any) {
    console.error("Error fetching employee:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    const success = await EmployeeService.updateEmployee(params.id, updates)

    if (!success) {
      return NextResponse.json({ error: "Employee not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({ message: "Employee updated successfully" })
  } catch (error: any) {
    console.error("Error updating employee:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await EmployeeService.deleteEmployee(params.id)

    if (!success) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Employee deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
