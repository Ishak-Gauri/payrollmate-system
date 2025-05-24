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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2, MoreHorizontal, Search, FileText, Download, AlertCircle, RefreshCw } from "lucide-react"
import { ExportButton } from "@/components/export/export-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Payslip } from "@/lib/models/payslip"
import { useToast } from "@/components/ui/use-toast"

export default function PayslipsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)

  const fetchPayslips = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching payslips...")
      let url = "/api/payslips"
      const params = new URLSearchParams()

      if (searchQuery) params.append("search", searchQuery)
      if (dateFilter) {
        const formattedDate = dateFilter.toISOString().split("T")[0]
        params.append("date", formattedDate)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      console.log("Fetching from URL:", url)
      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`Failed to fetch payslips: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Received payslips data:", data)

      // Ensure data is an array and handle different response formats
      let payslipsArray: Payslip[] = []
      if (Array.isArray(data)) {
        payslipsArray = data
      } else if (data && Array.isArray(data.payslips)) {
        payslipsArray = data.payslips
      } else if (data && Array.isArray(data.data)) {
        payslipsArray = data.data
      } else {
        console.warn("Unexpected data format:", data)
        payslipsArray = []
      }

      // Remove duplicates and ensure unique keys
      const uniquePayslips = payslipsArray.reduce((acc: Payslip[], current: Payslip) => {
        const existingIndex = acc.findIndex(
          (item) =>
            item.payslipId === current.payslipId ||
            (item._id && current._id && item._id.toString() === current._id.toString()),
        )

        if (existingIndex === -1) {
          acc.push(current)
        } else {
          // Keep the more complete record
          if (current.employeeName && !acc[existingIndex].employeeName) {
            acc[existingIndex] = current
          }
        }
        return acc
      }, [])

      console.log("Processed unique payslips:", uniquePayslips.length)
      setPayslips(uniquePayslips)
    } catch (error) {
      console.error("Error fetching payslips:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch payslips"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      // Set empty array as fallback
      setPayslips([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayslips()
  }, [searchQuery, dateFilter])

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Invalid Date"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const handleViewPayslip = (payslipId: string) => {
    if (!payslipId) {
      toast({
        title: "Error",
        description: "Invalid payslip ID",
        variant: "destructive",
      })
      return
    }
    router.push(`/payslips/${payslipId}`)
  }

  const handleDownloadPDF = async (payslipId: string) => {
    if (!payslipId) {
      toast({
        title: "Error",
        description: "Invalid payslip ID",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/payslips/${payslipId}/pdf`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to download payslip PDF")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a link element
      const link = document.createElement("a")
      link.href = url
      link.download = `payslip-${payslipId}.pdf`

      // Append the link to the body
      document.body.appendChild(link)

      // Click the link to trigger the download
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      toast({
        title: "PDF Downloaded",
        description: "Payslip PDF has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Error",
        description: "Failed to download payslip PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    fetchPayslips()
  }

  // Generate unique key for each payslip row
  const getUniqueKey = (payslip: Payslip, index: number) => {
    if (payslip._id) {
      return `payslip-${payslip._id.toString()}`
    }
    if (payslip.payslipId) {
      return `payslip-${payslip.payslipId}-${index}`
    }
    return `payslip-fallback-${index}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
            Payslips
          </h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage employee payslips</p>
        </div>
        <div className="mt-4 md:mt-0">
          <ExportButton data={payslips} type="payslips" />
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
            <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2 h-6 px-2 text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8 border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle>Payslip History</CardTitle>
          <CardDescription>View and download employee payslips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search by employee name or ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[240px]">
              <DatePicker placeholder="Filter by date" date={dateFilter} onDateChange={setDateFilter} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading payslips...</span>
            </div>
          ) : payslips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {error ? "Failed to load payslips" : "No payslips found"}
              </p>
              {error && (
                <Button variant="outline" onClick={handleRetry} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
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
                    <TableHead>Period</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Gross Amount</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip, index) => (
                    <TableRow
                      key={getUniqueKey(payslip, index)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell className="font-medium">{payslip.payslipId || `PS-${index + 1}`}</TableCell>
                      <TableCell>{payslip.employeeName || "Unknown Employee"}</TableCell>
                      <TableCell>{payslip.period || "N/A"}</TableCell>
                      <TableCell>{formatDate(payslip.date || new Date())}</TableCell>
                      <TableCell>${(payslip.grossAmount || 0).toLocaleString()}</TableCell>
                      <TableCell>${(payslip.netAmount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payslip.status || "pending")}>
                          {payslip.status || "Pending"}
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
                              onClick={() => handleViewPayslip(payslip.payslipId || payslip._id?.toString() || "")}
                              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Payslip
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadPDF(payslip.payslipId || payslip._id?.toString() || "")}
                              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
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
