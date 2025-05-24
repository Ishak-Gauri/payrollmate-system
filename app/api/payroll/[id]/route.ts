import { type NextRequest, NextResponse } from "next/server"
import { PayrollService } from "@/lib/services/payrollService"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payrollId = params.id

    if (!payrollId) {
      return NextResponse.json({ error: "Payroll ID is required" }, { status: 400 })
    }

    console.log("Fetching payroll details for ID:", payrollId)

    // Connect to database
    const db = await getDatabase()

    // Try to fetch the payroll by ID
    const payroll = await PayrollService.getPayrollById(payrollId)

    if (!payroll) {
      console.log("Payroll not found for ID:", payrollId)
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 })
    }

    console.log("Successfully fetched payroll:", payroll.payrollId || payroll._id)
    return NextResponse.json(payroll)
  } catch (error: any) {
    console.error("Error fetching payroll details:", error)

    // Return a more specific error message
    const errorMessage = error.message || "Failed to fetch payroll details"
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payrollId = params.id
    const updates = await request.json()

    if (!payrollId) {
      return NextResponse.json({ error: "Payroll ID is required" }, { status: 400 })
    }

    console.log("Updating payroll:", payrollId, updates)

    // Connect to database
    const db = await getDatabase()

    // Update the payroll
    const updatedPayroll = await PayrollService.updatePayroll(payrollId, updates)

    if (!updatedPayroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 })
    }

    console.log("Successfully updated payroll:", updatedPayroll.payrollId || updatedPayroll._id)
    return NextResponse.json(updatedPayroll)
  } catch (error: any) {
    console.error("Error updating payroll:", error)

    const errorMessage = error.message || "Failed to update payroll"
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payrollId = params.id

    if (!payrollId) {
      return NextResponse.json({ error: "Payroll ID is required" }, { status: 400 })
    }

    console.log("Deleting payroll:", payrollId)

    // Connect to database
    const db = await getDatabase()

    // Delete the payroll
    const result = await PayrollService.deletePayroll(payrollId)

    if (!result) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 })
    }

    console.log("Successfully deleted payroll:", payrollId)
    return NextResponse.json({ message: "Payroll deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting payroll:", error)

    const errorMessage = error.message || "Failed to delete payroll"
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
