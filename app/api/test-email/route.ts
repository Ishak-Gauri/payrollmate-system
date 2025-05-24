import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend with the API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Use Resend's default domain for immediate functionality
const companyName = process.env.COMPANY_NAME || "PayrollMate"
const fromEmail = "onboarding@resend.dev" // Resend's verified domain
const replyToEmail = process.env.FROM_EMAIL || "gauriishak17@gmail.com"

export async function POST(request: NextRequest) {
  try {
    const { to, type = "test" } = await request.json()

    if (!to) {
      return NextResponse.json({ success: false, error: "Email address is required" }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "Resend API key is not configured" }, { status: 500 })
    }

    let emailData: any = {
      from: fromEmail,
      to,
      reply_to: replyToEmail, // Users can reply to your Gmail
    }

    // Generate different email templates based on the type
    switch (type) {
      case "test":
        emailData = {
          ...emailData,
          subject: `✅ Email Test Successful - ${companyName}`,
          html: generateTestEmailTemplate(),
          text: `This is a test email from ${companyName} to verify that your email configuration is working correctly.`,
        }
        break

      case "welcome":
        emailData = {
          ...emailData,
          subject: `🎉 Welcome to ${companyName}!`,
          html: generateWelcomeEmailTemplate(to),
          text: `Welcome to ${companyName}! Your employee account has been created successfully.`,
        }
        break

      case "payslip":
        // No PDF attachment for now due to font issues
        emailData = {
          ...emailData,
          subject: `📄 Your Payslip for May 2024 - ${companyName}`,
          html: generatePayslipEmailTemplate(to),
          text: `Your payslip for May 2024 has been generated. Please view it online.`,
        }
        break

      default:
        return NextResponse.json({ success: false, error: "Invalid email type" }, { status: 400 })
    }

    const result = await resend.emails.send(emailData)

    if (result.error) {
      console.error("Email sending failed:", result.error)
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
      message: "Email sent successfully using Resend's verified domain",
    })
  } catch (error: any) {
    console.error("Error in test-email API:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to send email" }, { status: 500 })
  }
}

// Helper function to generate a test email template
function generateTestEmailTemplate() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Email Test Successful</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #bbf7d0; }
          .success-badge { background: #dcfce7; color: #166534; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
          .notice { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ${companyName}</h1>
            <p>Email Configuration Test Successful!</p>
          </div>
          <div class="content">
            <div class="success-badge">🎉 Configuration Working Perfectly!</div>
            
            <h2>Great News!</h2>
            <p>Your email configuration is working correctly and emails are being delivered successfully.</p>
            
            <div class="notice">
              <p><strong>📧 Email Setup Details:</strong></p>
              <ul>
                <li>✅ Resend API connection established</li>
                <li>✅ Email delivery confirmed</li>
                <li>✅ Templates rendering properly</li>
                <li>✅ Reply-to configured for support</li>
              </ul>
            </div>
            
            <p>The following email features are now available:</p>
            <ul>
              <li>📄 Payslip notifications</li>
              <li>👋 Welcome emails for new employees</li>
              <li>📊 Payroll processing summaries</li>
              <li>🔧 System notifications</li>
            </ul>
            
            <p><strong>Note:</strong> Emails are sent from Resend's verified domain but replies will come to your configured email address.</p>
            
            <div class="footer">
              <p>This is an automated test message from ${companyName} Payroll System.</p>
              <p>Test completed at: ${new Date().toLocaleString()}</p>
              <p>You can reply to this email for support.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

// Helper function to generate a welcome email template
function generateWelcomeEmailTemplate(email: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ${companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
          .notice { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ${companyName}!</h1>
          </div>
          <div class="content">
            <h2>Hello New Team Member,</h2>
            <p>Welcome to the team! Your employee account has been created successfully.</p>
            
            <div class="credentials">
              <h3>📋 Your Account Details:</h3>
              <p><strong>Employee ID:</strong> EMP12345</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Department:</strong> Finance</p>
              <p><strong>Position:</strong> Financial Analyst</p>
              <p><strong>Temporary Password:</strong> Welcome123</p>
            </div>

            <p>You can access your employee portal to view payslips, update your profile, and more.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" class="button">
              🚀 Access Employee Portal
            </a>

            <div class="notice">
              <p><strong>🔒 Security Notice:</strong> Please change your password after your first login for security.</p>
            </div>
            
            <p>If you have any questions, please contact the HR department by replying to this email.</p>
            
            <div class="footer">
              <p>This is an automated message from ${companyName} Payroll System.</p>
              <p>You can reply to this email for support.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

// Helper function to generate a payslip email template
function generatePayslipEmailTemplate(email: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Your Payslip</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .payslip-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .amount-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .amount-row:last-child { border-bottom: none; font-weight: bold; font-size: 1.1em; background: #f0f9ff; padding: 15px 10px; border-radius: 4px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
          .attachment-notice { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 ${companyName}</h1>
            <p>Payslip Notification</p>
          </div>
          <div class="content">
            <h2>Hello Employee,</h2>
            <p>Your payslip for <strong>May 2024</strong> has been generated and is ready for review.</p>
            
            <div class="attachment-notice">
              <p><strong>📱 Online Access:</strong> Your payslip is available online in the employee portal.</p>
            </div>
            
            <div class="payslip-summary">
              <h3>💰 Payslip Summary</h3>
              <div class="amount-row">
                <span>Payslip ID:</span>
                <span>PS-2024-05-001</span>
              </div>
              <div class="amount-row">
                <span>Period:</span>
                <span>May 1-31, 2024</span>
              </div>
              <div class="amount-row">
                <span>Gross Amount:</span>
                <span>$5,000.00</span>
              </div>
              <div class="amount-row">
                <span>Total Deductions:</span>
                <span>$1,250.00</span>
              </div>
              <div class="amount-row">
                <span>💵 Net Amount:</span>
                <span>$3,750.00</span>
              </div>
            </div>

            <p>You can view your complete payslip details by logging into the employee portal.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/payslips/sample" class="button">
              🔍 View Online Payslip
            </a>

            <p>If you have any questions about your payslip, please reply to this email or contact the HR department.</p>
            
            <div class="footer">
              <p>This is an automated message from ${companyName} Payroll System.</p>
              <p>You can reply to this email for support.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}
