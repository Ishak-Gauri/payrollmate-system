import { EmailService } from "./emailService"
import { PDFService } from "./pdfService"
import type { Employee } from "@/lib/models/employee"
import type { Payslip } from "@/lib/models/payslip"

export interface NotificationPreferences {
  emailNotifications: boolean
  payslipGenerated: boolean
  paymentProcessed: boolean
  welcomeEmail: boolean
}

export class NotificationService {
  static async sendPayslipNotification(employee: Employee, payslip: Payslip, includePDF = true): Promise<boolean> {
    try {
      let pdfBuffer: Buffer | undefined

      if (includePDF) {
        pdfBuffer = await PDFService.generatePayslipPDF(employee, payslip)
      }

      const emailSent = await EmailService.sendPayslipNotification(employee, payslip, pdfBuffer)

      // Log notification attempt
      console.log(`Payslip notification ${emailSent ? "sent" : "failed"} for employee ${employee.employeeId}`)

      return emailSent
    } catch (error) {
      console.error("Error in sendPayslipNotification:", error)
      return false
    }
  }

  static async sendBulkPayslipNotifications(
    employeePayslips: Array<{ employee: Employee; payslip: Payslip }>,
    includePDF = true,
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0
    let failed = 0

    // Process notifications in batches to avoid overwhelming the email service
    const batchSize = 5
    for (let i = 0; i < employeePayslips.length; i += batchSize) {
      const batch = employeePayslips.slice(i, i + batchSize)

      const promises = batch.map(async ({ employee, payslip }) => {
        const result = await this.sendPayslipNotification(employee, payslip, includePDF)
        return result ? "success" : "failed"
      })

      const results = await Promise.all(promises)
      successful += results.filter((r) => r === "success").length
      failed += results.filter((r) => r === "failed").length

      // Add a small delay between batches
      if (i + batchSize < employeePayslips.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return { successful, failed }
  }

  static async sendWelcomeNotification(employee: Employee, temporaryPassword?: string): Promise<boolean> {
    try {
      return await EmailService.sendWelcomeEmail(employee, temporaryPassword)
    } catch (error) {
      console.error("Error sending welcome notification:", error)
      return false
    }
  }

  static async sendPayrollSummaryNotification(
    adminEmail: string,
    payrollId: string,
    summary: { total: number; successful: number; failed: number },
  ): Promise<boolean> {
    try {
      return await EmailService.sendPayrollProcessedNotification(adminEmail, payrollId, summary)
    } catch (error) {
      console.error("Error sending payroll summary notification:", error)
      return false
    }
  }
}
