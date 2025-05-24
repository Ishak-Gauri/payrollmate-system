"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Search, FileText, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Payslip } from "@/lib/models/payslip"

export default function EmployeePayslipsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [generatingPayslipId, setGeneratingPayslipId] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchPayslips = async () => {
    if (status === "loading" || !session?.user?.id) return

    setIsLoading(true)
    setIsError(false)

    try {
      console.log("Fetching payslips for employee ID:", session.user.id)
      const response = await fetch(`/api/payslips/employee/${session.user.id}`, {
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
      console.log("Payslips data received:", data)

      // Ensure data is an array
      const payslipsArray = Array.isArray(data) ? data : []
      setPayslips(payslipsArray)
      setFilteredPayslips(payslipsArray)
    } catch (error: any) {
      console.error("Error fetching payslips:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: `Failed to fetch your payslips: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchPayslips()
    } else if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [session, status, retryCount, router])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPayslips(payslips)
    } else {
      const filtered = payslips.filter(
        (payslip) =>
          payslip.period?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payslip.payslipId?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPayslips(filtered)
    }
  }, [searchTerm, payslips])

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

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "$0.00"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "Generated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const handleViewPayslip = (payslipId: string) => {
    router.push(`/portal/payslips/${payslipId}`)
  }

  const handleDownloadPDF = async (payslipId: string) => {
    setIsGeneratingPdf(true)
    setGeneratingPayslipId(payslipId)

    try {
      // In a real application, this would call an API endpoint to generate a PDF
      // For now, we'll simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "PDF Generated",
        description: "Your payslip PDF has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPdf(false)
      setGeneratingPayslipId(null)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
          My Payslips
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and download your payslip documents</p>
      </div>

      <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800 mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Payslip History</CardTitle>
              <CardDescription>All your payslip documents</CardDescription>
            </div>
            <div className="mt-4 md:mt-0 relative flex items-center gap-2">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search payslips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full md:w-[250px]"
              />
              {isError && (
                <Button variant="outline" size="icon" onClick={handleRetry} className="flex-shrink-0">
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Retry</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                <p className="text-red-600 dark:text-red-400">Failed to load payslips</p>
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="mt-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
              </div>
            </div>
          ) : filteredPayslips.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No payslips found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payslip ID</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Gross Amount</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayslips.map((payslip) => (
                    <TableRow
                      key={payslip.payslipId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell className="font-medium">{payslip.payslipId}</TableCell>
                      <TableCell>{payslip.period || "N/A"}</TableCell>
                      <TableCell>{formatDate(payslip.date?.toString() || "")}</TableCell>
                      <TableCell>{formatCurrency(payslip.grossAmount)}</TableCell>
                      <TableCell>{formatCurrency(payslip.netAmount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payslip.status || "Pending")}>
                          {payslip.status || "Pending"}
                        </Badge>
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
                            onClick={() => handleDownloadPDF(payslip.payslipId)}
                            disabled={isGeneratingPdf && generatingPayslipId === payslip.payslipId}
                            className="hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            {isGeneratingPdf && generatingPayslipId === payslip.payslipId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
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
  )
}
