"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, DollarSign, Loader2, FileText, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Payroll } from "@/lib/models/payroll"
import type { Payslip } from "@/lib/models/payslip"

export default function PayrollDetailPage({ params }: { params: { id: string } }) {
  // Unwrap the params object using React.use()
  const unwrappedParams = React.use(params)
  const id = unwrappedParams.id

  const router = useRouter()
  const { toast } = useToast()
  const [payroll, setPayroll] = useState<Payroll | null>(null)
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const retryFetch = () => {
    setError(null)
    // Trigger re-fetch by updating a dependency
    fetchData()
  }

  const fetchData = async () => {
    if (!id) {
      console.error("No payroll ID provided")
      setPayroll(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching payroll details for ID:", id)

      // Fetch payroll details
      const payrollResponse = await fetch(`/api/payroll/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Payroll API response status:", payrollResponse.status)

      if (!payrollResponse.ok) {
        const errorData = await payrollResponse.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${payrollResponse.status}: ${payrollResponse.statusText}`
        console.error("Payroll API error:", errorMessage)
        throw new Error(errorMessage)
      }

      const payrollData = await payrollResponse.json()
      console.log("Successfully fetched payroll data:", payrollData)

      if (!payrollData) {
        throw new Error("No payroll data received")
      }

      setPayroll(payrollData)

      // Generate mock payslips for demonstration
      // In a real app, you would fetch actual payslips from the API
      const mockPayslips: Payslip[] = Array.from({ length: 5 }, (_, i) => ({
        payslipId: `PS-2023-${1000 + i}`,
        employeeId: `EMP00${i + 1}`,
        employeeName: `Employee ${i + 1}`,
        period: payrollData.period || "January 2024",
        date: new Date(payrollData.date || new Date()),
        grossAmount: 5000 + i * 500,
        netAmount: 4250 + i * 425,
        components: {
          basic: 3000 + i * 300,
          hra: 1200 + i * 120,
          specialAllowance: 800 + i * 80,
        },
        deductions: {
          pf: 360 + i * 36,
          tds: 390 + i * 39,
        },
        status: payrollData.status === "Completed" ? "Paid" : "Generated",
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      setPayslips(mockPayslips)
      console.log("Generated mock payslips:", mockPayslips.length)
    } catch (error: any) {
      console.error("Error in fetchData:", error)
      setError(error.message || "Failed to fetch payroll details")

      toast({
        title: "Error",
        description: error.message || "Failed to fetch payroll details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id, toast])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
      case "Processing":
      case "Generated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
      case "Paid":
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "Processing":
      case "Generated":
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case "Failed":
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return null
    }
  }

  const processPayroll = async () => {
    if (!payroll) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/payroll/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payrollId: payroll.payrollId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process payroll")
      }

      const result = await response.json()

      toast({
        title: "Payroll Processed",
        description: `Successfully processed payroll with ${result.summary.successful} payments.`,
      })

      // Update the payroll status
      setPayroll({ ...payroll, status: "Completed" })

      // Update the payslips status
      setPayslips(payslips.map((payslip) => ({ ...payslip, status: "Paid" })))
    } catch (error: any) {
      console.error("Error processing payroll:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process payroll. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewPayslip = (payslipId: string) => {
    router.push(`/payslips/${payslipId}`)
  }

  const handleDownloadPayrollReport = () => {
    toast({
      title: "Generating Report",
      description: "Your payroll report is being generated...",
    })

    // In a real app, this would call an API endpoint to generate a report
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: "Your payroll report has been downloaded successfully.",
      })
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Payroll</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">{error}</p>
            <div className="flex gap-2">
              <Button onClick={retryFetch} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => router.push("/payroll")}>Back to Payrolls</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!payroll) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">Payroll Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">The requested payroll could not be found.</p>
            <Button onClick={() => router.push("/payroll")}>View All Payrolls</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4 hover:bg-white/50 dark:hover:bg-gray-800/50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
              Payroll Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage payroll information</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={handleDownloadPayrollReport}
            >
              <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
            {payroll.status === "Pending" && (
              <Button
                className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white"
                onClick={processPayroll}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" /> Process Payroll
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-1 border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Summary</CardTitle>
                <Badge className={`border ${getStatusColor(payroll.status)} flex items-center gap-1 px-3 py-1`}>
                  {getStatusIcon(payroll.status)}
                  {payroll.status}
                </Badge>
              </div>
              <CardDescription>Payroll summary information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3 text-indigo-600 dark:text-indigo-400">Payroll Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Payroll ID</span>
                      <span className="font-medium">{payroll.payrollId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Period</span>
                      <span className="font-medium">{payroll.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Date</span>
                      <span className="font-medium">{formatDate(payroll.date.toString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Status</span>
                      <Badge className={getStatusColor(payroll.status)}>{payroll.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3 text-indigo-600 dark:text-indigo-400">Financial Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total Employees</span>
                      <span className="font-medium">{payroll.employees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total Amount</span>
                      <span className="font-medium">${payroll.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Average Salary</span>
                      <span className="font-medium">
                        $
                        {(payroll.totalAmount / payroll.employees).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3 text-indigo-600 dark:text-indigo-400">
                    Processing Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Created At</span>
                      <span className="font-medium">{formatDate(payroll.createdAt.toString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Last Updated</span>
                      <span className="font-medium">{formatDate(payroll.updatedAt.toString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Payment Method</span>
                      <span className="font-medium">Direct Deposit</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <CardHeader className="pb-2">
              <CardTitle>Payslips</CardTitle>
              <CardDescription>Employee payslips for this payroll period</CardDescription>
            </CardHeader>
            <CardContent>
              {payslips.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No payslips found for this payroll</p>
                  {payroll.status === "Pending" && (
                    <Button
                      onClick={processPayroll}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign className="mr-2 h-4 w-4" /> Process Payroll
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payslip ID</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Gross Amount</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payslips.map((payslip) => (
                        <TableRow
                          key={payslip.payslipId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <TableCell className="font-medium">{payslip.payslipId}</TableCell>
                          <TableCell>{payslip.employeeName}</TableCell>
                          <TableCell>${payslip.grossAmount.toLocaleString()}</TableCell>
                          <TableCell>${payslip.netAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payslip.status)}>{payslip.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewPayslip(payslip.payslipId)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadPayrollReport()}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
