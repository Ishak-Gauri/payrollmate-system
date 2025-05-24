import PDFDocument from "pdfkit"
import type { Employee } from "@/lib/models/employee"
import type { Payslip } from "@/lib/models/payslip"

export class PDFService {
  static async generatePayslipPDF(employee: Employee, payslip: Payslip): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create a PDF document with standard fonts only
        const doc = new PDFDocument({
          margin: 50,
          font: "Courier", // Use built-in fonts only
        })

        const chunks: Buffer[] = []

        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))
        doc.on("error", reject)

        // Header
        doc.fontSize(20).text("PAYSLIP", 50, 50, { align: "center" })
        doc.fontSize(12).text(process.env.COMPANY_NAME || "PayrollMate", 50, 80, { align: "center" })

        // Employee Details
        doc.fontSize(14).text("Employee Details", 50, 120)
        doc.fontSize(10)
        doc.text(`Name: ${employee.name}`, 50, 140)
        doc.text(`Employee ID: ${employee.employeeId}`, 50, 155)
        doc.text(`Department: ${employee.department}`, 50, 170)
        doc.text(`Position: ${employee.position}`, 50, 185)

        // Payslip Details
        doc.text(`Payslip ID: ${payslip.payslipId}`, 300, 140)
        doc.text(`Period: ${payslip.period}`, 300, 155)
        doc.text(`Date: ${new Date(payslip.date).toLocaleDateString()}`, 300, 170)
        doc.text(`Status: ${payslip.status}`, 300, 185)

        // Earnings Section
        let yPosition = 220
        doc.fontSize(14).text("Earnings", 50, yPosition)
        yPosition += 20

        doc.fontSize(10)
        doc.text("Description", 50, yPosition)
        doc.text("Amount", 450, yPosition, { align: "right" })
        yPosition += 15

        // Draw line
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke()
        yPosition += 10

        // Earnings items
        doc.text("Basic Salary", 50, yPosition)
        doc.text(`$${payslip.components.basic.toLocaleString()}`, 450, yPosition, { align: "right" })
        yPosition += 15

        doc.text("HRA", 50, yPosition)
        doc.text(`$${payslip.components.hra.toLocaleString()}`, 450, yPosition, { align: "right" })
        yPosition += 15

        doc.text("Special Allowance", 50, yPosition)
        doc.text(`$${payslip.components.specialAllowance.toLocaleString()}`, 450, yPosition, { align: "right" })
        yPosition += 15

        // Gross Total
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke()
        yPosition += 10
        doc.fontSize(12).text("Gross Total", 50, yPosition)
        doc.text(`$${payslip.grossAmount.toLocaleString()}`, 450, yPosition, { align: "right" })
        yPosition += 30

        // Deductions Section
        doc.fontSize(14).text("Deductions", 50, yPosition)
        yPosition += 20

        doc.fontSize(10)
        doc.text("Description", 50, yPosition)
        doc.text("Amount", 450, yPosition, { align: "right" })
        yPosition += 15

        // Draw line
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke()
        yPosition += 10

        // Deductions items
        if (payslip.deductions.incomeTax) {
          doc.text("Income Tax", 50, yPosition)
          doc.text(`$${payslip.deductions.incomeTax.toLocaleString()}`, 450, yPosition, { align: "right" })
          yPosition += 15
        }

        if (payslip.deductions.socialSecurity) {
          doc.text("Social Security", 50, yPosition)
          doc.text(`$${payslip.deductions.socialSecurity.toLocaleString()}`, 450, yPosition, { align: "right" })
          yPosition += 15
        }

        if (payslip.deductions.pf) {
          doc.text("Provident Fund", 50, yPosition)
          doc.text(`$${payslip.deductions.pf.toLocaleString()}`, 450, yPosition, { align: "right" })
          yPosition += 15
        }

        if (payslip.deductions.tds) {
          doc.text("TDS", 50, yPosition)
          doc.text(`$${payslip.deductions.tds.toLocaleString()}`, 450, yPosition, { align: "right" })
          yPosition += 15
        }

        // Total Deductions
        const totalDeductions = payslip.grossAmount - payslip.netAmount
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke()
        yPosition += 10
        doc.fontSize(12).text("Total Deductions", 50, yPosition)
        doc.text(`$${totalDeductions.toLocaleString()}`, 450, yPosition, { align: "right" })
        yPosition += 30

        // Net Pay
        doc.fontSize(16).text("Net Pay", 50, yPosition)
        doc.text(`$${payslip.netAmount.toLocaleString()}`, 450, yPosition, { align: "right" })

        // Tax Details (if available)
        if (payslip.taxDetails) {
          yPosition += 40
          doc.fontSize(14).text("Tax Information", 50, yPosition)
          yPosition += 20

          doc.fontSize(10)
          doc.text(`Taxable Income: $${payslip.taxDetails.taxableIncome.toLocaleString()}`, 50, yPosition)
          yPosition += 15
          doc.text(`Effective Tax Rate: ${(payslip.taxDetails.effectiveTaxRate * 100).toFixed(2)}%`, 50, yPosition)
          yPosition += 15
          doc.text(
            `Location: ${payslip.taxDetails.location.countryCode}${payslip.taxDetails.location.regionCode ? ` - ${payslip.taxDetails.location.regionCode}` : ""}`,
            50,
            yPosition,
          )
        }

        // Footer
        doc
          .fontSize(8)
          .text("This is a computer-generated payslip and does not require a signature.", 50, 750, { align: "center" })

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }
}
