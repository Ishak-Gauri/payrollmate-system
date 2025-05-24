"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Loader2, MoreHorizontal, Plus, DollarSign, RefreshCw, AlertCircle } from "lucide-react"
import { ExportButton } from "@/components/export/export-button"
import type { Payroll } from "@/lib/models/payroll"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PayrollPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchPayrolls = async () => {
    setIsLoading(true)
    setIsError(false)

    try {
      console.log("Fetching payrolls data...")
      const response = await fetch("/api/payroll", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error response:", response.status, errorData)
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const data = await response.json()
      console.log("Payrolls data received:", data)

      // Ensure data is an array
      const payrollsArray = Array.isArray(data) ? data : []
      setPayrolls(payrollsArray)
    } catch (error: any) {
      console.error("Error fetching payrolls:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: `Failed to fetch payrolls: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayrolls()
  }, [retryCount])

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return "Invalid Date"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "Processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const processPayroll = async (payrollId: string) => {
    setIsProcessing(true)
    setProcessingId(payrollId)

    try {
      const response = await fetch("/api/payroll/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payrollId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to process payroll")
      }

      const result = await response.json()

      toast({
        title: "Payroll Processed",
        description: `Successfully processed payroll with ${result.summary?.successful || 0} payments.`,
      })

      // Refresh payroll list
      const updatedPayrolls = payrolls.map((payroll) =>
        payroll.payrollId === payrollId ? { ...payroll, status: "Completed" } : payroll,
      )
      setPayrolls(updatedPayrolls)
    } catch (error: any) {
      console.error("Error processing payroll:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process payroll. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingId(null)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
            Payroll
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and process payrolls</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          {!isError && payrolls.length > 0 && <ExportButton data={payrolls} type="payrolls" />}
          <Button
            className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
            onClick={() => router.push("/payroll/create")}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Payroll
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load payrolls. Please try again.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="mr-2 h-3 w-3" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8 border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
        <CardHeader className="pb-2">
          <CardTitle>Payroll History</CardTitle>
          <CardDescription>View and manage all payrolls</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
            </div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No payrolls found</p>
              <Button
                variant="outline"
                onClick={() => router.push("/payroll/create")}
                className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" /> Create your first payroll
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payroll ID</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow
                      key={payroll.payrollId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell className="font-medium">{payroll.payrollId}</TableCell>
                      <TableCell>{payroll.period || "N/A"}</TableCell>
                      <TableCell>{formatDate(payroll.date?.toString() || "")}</TableCell>
                      <TableCell>{payroll.employees || 0}</TableCell>
                      <TableCell>${(payroll.totalAmount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payroll.status || "Pending")}>
                          {payroll.status || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/payroll/${payroll.payrollId}`)}
                              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              View Details
                            </DropdownMenuItem>
                            {payroll.status === "Pending" && (
                              <DropdownMenuItem
                                onClick={() => processPayroll(payroll.payrollId)}
                                disabled={isProcessing}
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                {isProcessing && processingId === payroll.payrollId ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <DollarSign className="mr-2 h-4 w-4" />
                                )}
                                Process Payroll
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this payroll?")) {
                                  // Delete payroll logic
                                }
                              }}
                              disabled={payroll.status !== "Pending"}
                            >
                              Delete Payroll
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
  )
}
