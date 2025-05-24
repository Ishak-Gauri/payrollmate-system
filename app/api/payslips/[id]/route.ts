import { type NextRequest, NextResponse } from "next/server"
import { PayslipService } from "@/lib/services/payslipService"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payslipId = params.id

    if (!payslipId) {
      return NextResponse.json({ error: "Payslip ID is required" }, { status: 400 })
    }

    console.log("Fetching payslip with ID:", payslipId)

    const payslip = await PayslipService.getPayslipById(payslipId)

    if (!payslip) {
      console.log("Payslip not found for ID:", payslipId)
      return NextResponse.json({ error: "Payslip not found" }, { status: 404 })
    }

    console.log("Payslip found:", payslip.payslipId)
    return NextResponse.json(payslip)
  } catch (error: any) {
    console.error("Error fetching payslip:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch payslip" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payslipId = params.id
    const updates = await request.json()

    if (!payslipId) {
      return NextResponse.json({ error: "Payslip ID is required" }, { status: 400 })
    }

    // Update payslip status or other fields
    const success = await PayslipService.updatePayslipStatus(payslipId, updates.status, updates.paymentId)

    if (!success) {
      return NextResponse.json({ error: "Failed to update payslip" }, { status: 404 })
    }

    return NextResponse.json({ message: "Payslip updated successfully" })
  } catch (error: any) {
    console.error("Error updating payslip:", error)
    return NextResponse.json({ error: error.message || "Failed to update payslip" }, { status: 500 })
  }
}
