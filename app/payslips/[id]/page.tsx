"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import type { Payslip } from "@/lib/models/payslip"
import { getCountryName } from "@/lib/utils/countries"
import { Download, Printer, ArrowLeft, RefreshCw } from "lucide-react"

export default function PayslipDetailPage({ params }: { params: { id: string } }) {
  // Unwrap the params object using React.use()
  const unwrappedParams = React.use(params)

  const router = useRouter()
  const [payslip, setPayslip] = useState<Payslip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const payslipId = unwrappedParams.id

  // Fetch payslip when component mounts
  useEffect(() => {
    if (payslipId) {
      fetchPayslip()
    }
  }, [payslipId])

  async function fetchPayslip() {
    if (!payslipId) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching payslip with ID:", payslipId)
      const response = await fetch(`/api/payslips/${payslipId}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch payslip (${response.status})`)
      }

      const data = await response.json()
      console.log("Payslip data received:", data)

      if (!data) {
        throw new Error("No payslip data received")
      }

      setPayslip(data)
    } catch (error: any) {
      console.error("Error fetching payslip:", error)
      const errorMessage = error.message || "Failed to fetch payslip"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function formatCurrency(amount: number | undefined) {
    if (typeof amount !== "number") return "$0.00"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  function formatDate(date: string | Date | undefined) {
    if (!date) return "N/A"
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  function getStatusColor(status: string | undefined) {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  function handlePrint() {
    window.print()
  }

  async function handleDownloadPDF() {
    try {
      setIsLoading(true)

      // Generate PDF using the PDF service
      const response = await fetch(`/api/payslips/${payslipId}/pdf`)

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `payslip-${payslipId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Payslip PDF downloaded successfully",
      })
    } catch (error: any) {
      console.error("PDF download error:", error)
      toast({
        title: "Download Failed",
        description: "Unable to download PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleRetry() {
    fetchPayslip()
  }

  if (isLoading && !payslip) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading payslip...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !payslip) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!payslip) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="mb-4">Payslip not found.</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 print:py-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isLoading}>
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="mb-8 print:shadow-none print:border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Payslip #{payslip.payslipId || payslipId}</CardTitle>
            <CardDescription>
              {payslip.period || "N/A"} | {formatDate(payslip.date)}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(payslip.status)}>{payslip.status || "Pending"}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Employee</h3>
              <p className="text-lg font-semibold">{payslip.employeeName || "N/A"}</p>
              <p className="text-sm text-muted-foreground">ID: {payslip.employeeId || "N/A"}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-muted-foreground">Payment</h3>
              <p className="text-lg font-semibold">{formatCurrency(payslip.netAmount)}</p>
              <p className="text-sm text-muted-foreground">Net Amount</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Earnings</h3>
              <div className="space-y-2">
                {payslip.components && (
                  <>
                    <div className="flex justify-between">
                      <span>Basic Salary</span>
                      <span>{formatCurrency(payslip.components.basic)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HRA</span>
                      <span>{formatCurrency(payslip.components.hra)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Special Allowance</span>
                      <span>{formatCurrency(payslip.components.specialAllowance)}</span>
                    </div>
                    {Object.entries(payslip.components)
                      .filter(([key]) => !["basic", "hra", "specialAllowance"].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</span>
                          <span>{formatCurrency(value as number)}</span>
                        </div>
                      ))}
                  </>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Gross Earnings</span>
                  <span>{formatCurrency(payslip.grossAmount)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Deductions</h3>
              <div className="space-y-2">
                {payslip.deductions && (
                  <>
                    {payslip.deductions.incomeTax !== undefined && (
                      <div className="flex justify-between">
                        <span>Income Tax</span>
                        <span>{formatCurrency(payslip.deductions.incomeTax)}</span>
                      </div>
                    )}
                    {payslip.deductions.socialSecurity !== undefined && (
                      <div className="flex justify-between">
                        <span>Social Security</span>
                        <span>{formatCurrency(payslip.deductions.socialSecurity)}</span>
                      </div>
                    )}
                    {payslip.deductions.pf !== undefined && (
                      <div className="flex justify-between">
                        <span>Provident Fund</span>
                        <span>{formatCurrency(payslip.deductions.pf)}</span>
                      </div>
                    )}
                    {payslip.deductions.tds !== undefined && (
                      <div className="flex justify-between">
                        <span>TDS</span>
                        <span>{formatCurrency(payslip.deductions.tds)}</span>
                      </div>
                    )}
                    {payslip.deductions.otherDeductions &&
                      Object.entries(payslip.deductions.otherDeductions).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key}</span>
                          <span>{formatCurrency(value)}</span>
                        </div>
                      ))}
                  </>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Deductions</span>
                  <span>{formatCurrency((payslip.grossAmount || 0) - (payslip.netAmount || 0))}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Net Pay</span>
            <span className="text-xl font-bold">{formatCurrency(payslip.netAmount)}</span>
          </div>

          {payslip.taxDetails && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tax Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Taxable Income</p>
                    <p className="font-medium">{formatCurrency(payslip.taxDetails.taxableIncome)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Effective Tax Rate</p>
                    <p className="font-medium">{payslip.taxDetails.effectiveTaxRate?.toFixed(2) || "0"}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Employer Contribution</p>
                    <p className="font-medium">{formatCurrency(payslip.taxDetails.employerContribution)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tax Jurisdiction</p>
                    <p className="font-medium">
                      {payslip.taxDetails.location?.countryCode
                        ? getCountryName(payslip.taxDetails.location.countryCode)
                        : "N/A"}
                      {payslip.taxDetails.location?.regionCode && ` (${payslip.taxDetails.location.regionCode})`}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t pt-6">
          <p className="text-sm text-muted-foreground">
            This is a computer-generated document and does not require a signature.
          </p>
          {payslip.paymentId && (
            <p className="text-sm text-muted-foreground mt-1">Payment Reference: {payslip.paymentId}</p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
