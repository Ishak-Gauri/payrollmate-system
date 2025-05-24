import { type NextRequest, NextResponse } from "next/server"
import { PayslipService } from "@/lib/services/payslipService"
import { PDFService } from "@/lib/services/pdfService"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payslipId = params.id

    if (!payslipId) {
      return NextResponse.json({ error: "Payslip ID is required" }, { status: 400 })
    }

    console.log("Generating PDF for payslip ID:", payslipId)

    // Fetch the payslip
    const payslip = await PayslipService.getPayslipById(payslipId)

    if (!payslip) {
      return NextResponse.json({ error: "Payslip not found" }, { status: 404 })
    }

    // Generate PDF
    const pdfBuffer = await PDFService.generatePayslipPDF(payslip)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="payslip-${payslipId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error("Error generating payslip PDF:", error)
    return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 })
  }
}
