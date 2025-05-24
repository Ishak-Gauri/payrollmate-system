import { Resend } from "resend"
import type { Employee } from "@/lib/models/employee"
import type { Payslip } from "@/lib/models/payslip"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  // Use Resend's default domain for immediate functionality
  private static fromEmail = "onboarding@resend.dev"
  private static companyName = process.env.COMPANY_NAME || "PayrollMate"
  private static replyToEmail = process.env.FROM_EMAIL || "gauriishak17@gmail.com"

  static async sendPayslipNotification(employee: Employee, payslip: Payslip, pdfBuffer?: Buffer): Promise<boolean> {
    try {
      const template = this.generatePayslipEmailTemplate(employee, payslip)

      const emailData: any = {
        from: this.fromEmail,
        to: employee.email,
        reply_to: this.replyToEmail, // Users can reply to your Gmail
        subject: template.subject,
        html: template.html,
        text: template.text,
      }

      // Add PDF attachment if provided
      if (pdfBuffer) {
        emailData.attachments = [
          {
            filename: `payslip-${payslip.payslipId}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      }

      const result = await resend.emails.send(emailData)

      if (result.error) {
        console.error("Email sending failed:", result.error)
        return false
      }

      console.log("Payslip email sent successfully:", result.data?.id)
      return true
    } catch (error) {
      console.error("Error sending payslip email:", error)
      return false
    }
  }

  static async sendPayrollProcessedNotification(
    adminEmail: string,
    payrollId: string,
    summary: {
      total: number
      successful: number
      failed: number
    },
  ): Promise<boolean> {
    try {
      const template = this.generatePayrollSummaryEmailTemplate(payrollId, summary)

      const result = await resend.emails.send({
        from: this.fromEmail,
        to: adminEmail,
        reply_to: this.replyToEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (result.error) {
        console.error("Admin notification failed:", result.error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending admin notification:", error)
      return false
    }
  }

  static async sendWelcomeEmail(employee: Employee, temporaryPassword?: string): Promise<boolean> {
    try {
      const template = this.generateWelcomeEmailTemplate(employee, temporaryPassword)

      const result = await resend.emails.send({
        from: this.fromEmail,
        to: employee.email,
        reply_to: this.replyToEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (result.error) {
        console.error("Welcome email failed:", result.error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending welcome email:", error)
      return false
    }
  }

  private static generatePayslipEmailTemplate(employee: Employee, payslip: Payslip): EmailTemplate {
    const subject = `Your Payslip for ${payslip.period} - ${this.companyName}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .payslip-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .amount-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .amount-row:last-child { border-bottom: none; font-weight: bold; font-size: 1.1em; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
            .notice { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${this.companyName}</h1>
              <p>Payslip Notification</p>
            </div>
            <div class="content">
              <h2>Hello ${employee.name},</h2>
              <p>Your payslip for <strong>${payslip.period}</strong> has been generated and is ready for review.</p>
              
              <div class="payslip-summary">
                <h3>Payslip Summary</h3>
                <div class="amount-row">
                  <span>Payslip ID:</span>
                  <span>${payslip.payslipId}</span>
                </div>
                <div class="amount-row">
                  <span>Period:</span>
                  <span>${payslip.period}</span>
                </div>
                <div class="amount-row">
                  <span>Gross Amount:</span>
                  <span>$${payslip.grossAmount.toLocaleString()}</span>
                </div>
                <div class="amount-row">
                  <span>Total Deductions:</span>
                  <span>$${(payslip.grossAmount - payslip.netAmount).toLocaleString()}</span>
                </div>
                <div class="amount-row">
                  <span>Net Amount:</span>
                  <span>$${payslip.netAmount.toLocaleString()}</span>
                </div>
              </div>

              <p>You can view your complete payslip details by logging into the employee portal.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/payslips/${payslip.payslipId}" class="button">
                View Payslip
              </a>

              <div class="notice">
                <p><strong>Note:</strong> This email was sent from our notification system. For any questions about your payslip, please reply to this email or contact HR directly.</p>
              </div>
              
              <div class="footer">
                <p>This is an automated message from ${this.companyName} Payroll System.</p>
                <p>You can reply to this email for support.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Hello ${employee.name},

      Your payslip for ${payslip.period} has been generated.

      Payslip Summary:
      - Payslip ID: ${payslip.payslipId}
      - Period: ${payslip.period}
      - Gross Amount: $${payslip.grossAmount.toLocaleString()}
      - Net Amount: $${payslip.netAmount.toLocaleString()}

      View your complete payslip at: ${process.env.NEXT_PUBLIC_APP_URL}/portal/payslips/${payslip.payslipId}

      For questions, reply to this email or contact HR.

      Best regards,
      ${this.companyName} Payroll Team
    `

    return { subject, html, text }
  }

  private static generatePayrollSummaryEmailTemplate(
    payrollId: string,
    summary: { total: number; successful: number; failed: number },
  ): EmailTemplate {
    const subject = `Payroll Processing Complete - ${payrollId}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 20px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; padding: 15px; background: white; border-radius: 8px; }
            .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payroll Processing Complete</h1>
            </div>
            <div class="content">
              <h2>Payroll ID: ${payrollId}</h2>
              <p>The payroll processing has been completed. Here's a summary:</p>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">${summary.total}</div>
                  <div>Total Employees</div>
                </div>
                <div class="stat">
                  <div class="stat-number" style="color: #28a745;">${summary.successful}</div>
                  <div>Successful</div>
                </div>
                <div class="stat">
                  <div class="stat-number" style="color: #dc3545;">${summary.failed}</div>
                  <div>Failed</div>
                </div>
              </div>

              <p>Please review the payroll details in the admin dashboard for any failed payments.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Payroll Processing Complete - ${payrollId}

      Summary:
      - Total Employees: ${summary.total}
      - Successful: ${summary.successful}
      - Failed: ${summary.failed}

      Please review the payroll details in the admin dashboard.
    `

    return { subject, html, text }
  }

  private static generateWelcomeEmailTemplate(employee: Employee, temporaryPassword?: string): EmailTemplate {
    const subject = `Welcome to ${this.companyName} - Your Account Details`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${this.companyName}!</h1>
            </div>
            <div class="content">
              <h2>Hello ${employee.name},</h2>
              <p>Welcome to the team! Your employee account has been created successfully.</p>
              
              <div class="credentials">
                <h3>Your Account Details:</h3>
                <p><strong>Employee ID:</strong> ${employee.employeeId}</p>
                <p><strong>Email:</strong> ${employee.email}</p>
                <p><strong>Department:</strong> ${employee.department}</p>
                <p><strong>Position:</strong> ${employee.position}</p>
                ${temporaryPassword ? `<p><strong>Temporary Password:</strong> ${temporaryPassword}</p>` : ""}
              </div>

              <p>You can access your employee portal to view payslips, update your profile, and more.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" class="button">
                Access Employee Portal
              </a>

              ${temporaryPassword ? "<p><strong>Important:</strong> Please change your password after your first login for security.</p>" : ""}
              
              <p>If you have any questions, please contact the HR department by replying to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Welcome to ${this.companyName}!

      Hello ${employee.name},

      Your employee account has been created successfully.

      Account Details:
      - Employee ID: ${employee.employeeId}
      - Email: ${employee.email}
      - Department: ${employee.department}
      - Position: ${employee.position}
      ${temporaryPassword ? `- Temporary Password: ${temporaryPassword}` : ""}

      Access your employee portal at: ${process.env.NEXT_PUBLIC_APP_URL}/portal

      Best regards,
      ${this.companyName} HR Team
    `

    return { subject, html, text }
  }
}
