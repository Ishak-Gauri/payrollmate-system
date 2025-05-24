"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Mail, Send, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VerifyEmailSetupPage() {
  const [testEmail, setTestEmail] = useState("gauriishak17@gmail.com")
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    test?: boolean
    welcome?: boolean
    payslip?: boolean
  }>({})
  const { toast } = useToast()

  // Use the environment variable
  const isResendConfigured = process.env.NEXT_PUBLIC_RESEND_CONFIGURED === "true"

  const sendTestEmail = async (type: "test" | "welcome" | "payslip") => {
    if (!isResendConfigured) {
      toast({
        title: "Configuration Error",
        description: "Resend API is not properly configured. Please check your environment variables.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testEmail,
          type,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setTestResults((prev) => ({ ...prev, [type]: true }))
        toast({
          title: "Email sent successfully!",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} email sent to ${testEmail}`,
        })
      } else {
        setTestResults((prev) => ({ ...prev, [type]: false }))
        throw new Error(result.error || "Failed to send email")
      }
    } catch (error: any) {
      setTestResults((prev) => ({ ...prev, [type]: false }))
      toast({
        title: "Email failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const configStatus = {
    resendKey: isResendConfigured,
    fromEmail: "gauriishak17@gmail.com",
    companyName: "Payroll",
    adminEmail: "gauriishak17@gmail.com",
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="h-8 w-8" />
          Email Setup Verification
        </h1>
        <p className="text-muted-foreground mt-2">
          Verify that your email configuration is working correctly before processing payroll
        </p>
      </div>

      {!isResendConfigured && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Resend API is not properly configured. Please check your environment variables and restart the application.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
            <CardDescription>Current email configuration settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Resend API Key</span>
                {configStatus.resendKey ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    Not Configured
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">From Email</span>
                <Badge variant="outline">{configStatus.fromEmail}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Company Name</span>
                <Badge variant="outline">{configStatus.companyName}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Admin Email</span>
                <Badge variant="outline">{configStatus.adminEmail}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Test Email Functionality</CardTitle>
            <CardDescription>Send test emails to verify your configuration is working</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address for testing"
              />
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Configuration Test Email</h4>
                  <p className="text-sm text-muted-foreground">
                    Sends a basic test email to verify Resend configuration
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.test !== undefined && (
                    <Badge variant={testResults.test ? "default" : "destructive"}>
                      {testResults.test ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      {testResults.test ? "Success" : "Failed"}
                    </Badge>
                  )}
                  <Button onClick={() => sendTestEmail("test")} disabled={loading || !testEmail || !isResendConfigured}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Test
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Welcome Email Template</h4>
                  <p className="text-sm text-muted-foreground">
                    Tests the welcome email template sent to new employees
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.welcome !== undefined && (
                    <Badge variant={testResults.welcome ? "default" : "destructive"}>
                      {testResults.welcome ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      {testResults.welcome ? "Success" : "Failed"}
                    </Badge>
                  )}
                  <Button
                    onClick={() => sendTestEmail("welcome")}
                    disabled={loading || !testEmail || !isResendConfigured}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Test
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Payslip Email Template</h4>
                  <p className="text-sm text-muted-foreground">
                    Tests the payslip notification email with PDF attachment
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.payslip !== undefined && (
                    <Badge variant={testResults.payslip ? "default" : "destructive"}>
                      {testResults.payslip ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      {testResults.payslip ? "Success" : "Failed"}
                    </Badge>
                  )}
                  <Button
                    onClick={() => sendTestEmail("payslip")}
                    disabled={loading || !testEmail || !isResendConfigured}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Test
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>What to do after verifying your email setup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Test all email types above</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure configuration, welcome, and payslip emails are working
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Check your email inbox</p>
                  <p className="text-sm text-muted-foreground">
                    Verify the emails look professional and contain correct information
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Process your first payroll</p>
                  <p className="text-sm text-muted-foreground">
                    Employees will automatically receive payslip notifications
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
