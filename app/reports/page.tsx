"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { Download, FileText, Filter, Printer, Calendar, ChevronRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { exportToExcel, exportToPDF, exportToCSV } from "@/lib/utils/export-utils"

// Sample data for charts
const departmentExpenseData = [
  { name: "Engineering", value: 120000 },
  { name: "Marketing", value: 80000 },
  { name: "Sales", value: 100000 },
  { name: "Finance", value: 50000 },
  { name: "HR", value: 30000 },
]

const monthlyExpenseData = [
  { month: "Jan", amount: 42000 },
  { month: "Feb", amount: 45000 },
  { month: "Mar", amount: 48000 },
  { month: "Apr", amount: 51000 },
  { month: "May", amount: 53000 },
  { month: "Jun", amount: 55000 },
]

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"]

// Sample report data
const recentReports = [
  {
    id: "payroll-q2-2023",
    title: "Payroll Summary - Q2 2023",
    date: "June 30, 2023",
    type: "payroll",
    period: "Q2 2023",
    data: [
      { department: "Engineering", employees: 12, totalSalary: 120000, taxes: 24000, netPay: 96000 },
      { department: "Marketing", employees: 8, totalSalary: 80000, taxes: 16000, netPay: 64000 },
      { department: "Sales", employees: 10, totalSalary: 100000, taxes: 20000, netPay: 80000 },
      { department: "Finance", employees: 5, totalSalary: 50000, taxes: 10000, netPay: 40000 },
      { department: "HR", employees: 3, totalSalary: 30000, taxes: 6000, netPay: 24000 },
    ],
  },
  {
    id: "tax-q1-2023",
    title: "Tax Report - Q1 2023",
    date: "March 31, 2023",
    type: "tax",
    period: "Q1 2023",
    data: [
      { taxType: "Income Tax", amount: 45000, percentage: "20%" },
      { taxType: "Social Security", amount: 22500, percentage: "10%" },
      { taxType: "Medicare", amount: 11250, percentage: "5%" },
      { taxType: "State Tax", amount: 13500, percentage: "6%" },
      { taxType: "Local Tax", amount: 4500, percentage: "2%" },
    ],
  },
  {
    id: "department-q1-2023",
    title: "Department Expenses - Q1 2023",
    date: "March 31, 2023",
    type: "department",
    period: "Q1 2023",
    data: departmentExpenseData,
  },
]

export default function ReportsPage() {
  const { toast } = useToast()
  const [reportType, setReportType] = useState("payroll")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), 0, 1))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)

  const handleGenerateReport = () => {
    setIsGenerating(true)
    toast({
      title: "Generating Report",
      description: `Generating ${reportType} report from ${startDate?.toLocaleDateString()} to ${endDate?.toLocaleDateString()}`,
    })

    // In a real app, this would call an API to generate a report
    setTimeout(() => {
      setIsGenerating(false)
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully.",
      })
    }, 2000)
  }

  const handleDownloadReport = (reportId: string, format: "pdf" | "excel" | "csv" = "pdf") => {
    setIsDownloading(reportId)

    // Find the report data
    const report = recentReports.find((r) => r.id === reportId)

    if (!report) {
      toast({
        title: "Error",
        description: "Report not found",
        variant: "destructive",
      })
      setIsDownloading(null)
      return
    }

    toast({
      title: "Preparing Download",
      description: `Preparing ${report.title} for download...`,
    })

    // Simulate download delay
    setTimeout(() => {
      try {
        // Handle different report types
        if (report.type === "payroll") {
          if (format === "pdf") {
            exportToPDF(
              report.data,
              `payroll_summary_${report.period.replace(/\s/g, "_").toLowerCase()}`,
              `Payroll Summary - ${report.period}`,
              [
                { header: "Department", dataKey: "department" },
                { header: "Employees", dataKey: "employees" },
                { header: "Total Salary", dataKey: "totalSalary" },
                { header: "Taxes", dataKey: "taxes" },
                { header: "Net Pay", dataKey: "netPay" },
              ],
            )
          } else if (format === "excel") {
            exportToExcel(
              report.data,
              `payroll_summary_${report.period.replace(/\s/g, "_").toLowerCase()}`,
              "Payroll Summary",
              [
                { header: "Department", key: "department" },
                { header: "Employees", key: "employees" },
                { header: "Total Salary", key: "totalSalary" },
                { header: "Taxes", key: "taxes" },
                { header: "Net Pay", key: "netPay" },
              ],
            )
          } else {
            exportToCSV(report.data, `payroll_summary_${report.period.replace(/\s/g, "_").toLowerCase()}`)
          }
        } else if (report.type === "tax") {
          if (format === "pdf") {
            exportToPDF(
              report.data,
              `tax_report_${report.period.replace(/\s/g, "_").toLowerCase()}`,
              `Tax Report - ${report.period}`,
              [
                { header: "Tax Type", dataKey: "taxType" },
                { header: "Amount", dataKey: "amount" },
                { header: "Percentage", dataKey: "percentage" },
              ],
            )
          } else if (format === "excel") {
            exportToExcel(report.data, `tax_report_${report.period.replace(/\s/g, "_").toLowerCase()}`, "Tax Report", [
              { header: "Tax Type", key: "taxType" },
              { header: "Amount", key: "amount" },
              { header: "Percentage", key: "percentage" },
            ])
          } else {
            exportToCSV(report.data, `tax_report_${report.period.replace(/\s/g, "_").toLowerCase()}`)
          }
        } else if (report.type === "department") {
          if (format === "pdf") {
            exportToPDF(
              report.data,
              `department_expenses_${report.period.replace(/\s/g, "_").toLowerCase()}`,
              `Department Expenses - ${report.period}`,
              [
                { header: "Department", dataKey: "name" },
                { header: "Expenses", dataKey: "value" },
              ],
            )
          } else if (format === "excel") {
            exportToExcel(
              report.data,
              `department_expenses_${report.period.replace(/\s/g, "_").toLowerCase()}`,
              "Department Expenses",
              [
                { header: "Department", key: "name" },
                { header: "Expenses", key: "value" },
              ],
            )
          } else {
            exportToCSV(report.data, `department_expenses_${report.period.replace(/\s/g, "_").toLowerCase()}`)
          }
        }

        toast({
          title: "Download Complete",
          description: "Your report has been downloaded successfully.",
        })
      } catch (error) {
        console.error("Error downloading report:", error)
        toast({
          title: "Download Failed",
          description: "There was an error downloading your report. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDownloading(null)
      }
    }, 1500)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format for download button
  const DownloadButton = ({ reportId }: { reportId: string }) => (
    <Button
      variant="outline"
      size="sm"
      className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
      onClick={() => handleDownloadReport(reportId)}
      disabled={isDownloading === reportId}
    >
      {isDownloading === reportId ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Downloading...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" /> Download
          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </Button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
              Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Generate and view financial reports</p>
          </div>
        </div>

        <Card className="mb-8 border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-3">
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>Select report type and date range</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payroll">Payroll Summary</SelectItem>
                    <SelectItem value="employee">Employee Costs</SelectItem>
                    <SelectItem value="department">Department Expenses</SelectItem>
                    <SelectItem value="tax">Tax Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <DatePicker date={startDate} setDate={setStartDate} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white"
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    "Generate Report"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="summary" className="mb-8">
          <TabsList className="mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <TabsTrigger
              value="summary"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md transition-all"
            >
              Summary
            </TabsTrigger>
            <TabsTrigger
              value="department"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md transition-all"
            >
              Department
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md transition-all"
            >
              Monthly
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                <div>
                  <CardTitle>Payroll Summary Report</CardTitle>
                  <CardDescription>January 1, 2023 - June 30, 2023</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </Button>
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 hidden group-hover:block z-10">
                      <div className="py-1">
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => handleDownloadReport("payroll-q2-2023", "pdf")}
                        >
                          Download as PDF
                        </button>
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => handleDownloadReport("payroll-q2-2023", "excel")}
                        >
                          Download as Excel
                        </button>
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => handleDownloadReport("payroll-q2-2023", "csv")}
                        >
                          Download as CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
                      Summary Statistics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="font-medium">Total Payroll</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(380000)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="font-medium">Average Monthly</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(63333)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="font-medium">Total Employees</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">38</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="font-medium">Total Payslips</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">228</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="font-medium">Tax Deductions</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(76000)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
                      Department Distribution
                    </h3>
                    <div className="h-[300px] bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={departmentExpenseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {departmentExpenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [formatCurrency(value as number), "Amount"]}
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              border: "none",
                            }}
                          />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            iconSize={10}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="department">
            <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                <div>
                  <CardTitle>Department Expenses</CardTitle>
                  <CardDescription>January 1, 2023 - June 30, 2023</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 hidden group-hover:block z-10">
                      <div className="py-1">
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => handleDownloadReport("department-q1-2023", "pdf")}
                        >
                          Download as PDF
                        </button>
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => handleDownloadReport("department-q1-2023", "excel")}
                        >
                          Download as Excel
                        </button>
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => handleDownloadReport("department-q1-2023", "csv")}
                        >
                          Download as CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentExpenseData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        type="number"
                        tickFormatter={(value) => formatCurrency(value)}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        axisLine={false}
                        tickLine={false}
                        style={{ fontSize: "12px" }}
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value as number), "Amount"]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          border: "none",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="url(#barGradient)">
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#818cf8" />
                          </linearGradient>
                        </defs>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="monthly">
            <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                <div>
                  <CardTitle>Monthly Expenses</CardTitle>
                  <CardDescription>January 1, 2023 - June 30, 2023</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </Button>
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 hidden group-hover:block z-10">
                      <div className="py-1">
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => {
                            const monthlyData = monthlyExpenseData.map((item) => ({
                              Month: item.month,
                              Amount: item.amount,
                            }))
                            exportToPDF(monthlyData, "monthly_expenses_report", "Monthly Expenses Report", [
                              { header: "Month", dataKey: "Month" },
                              { header: "Amount", dataKey: "Amount" },
                            ])
                          }}
                        >
                          Download as PDF
                        </button>
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => {
                            const monthlyData = monthlyExpenseData.map((item) => ({
                              Month: item.month,
                              Amount: item.amount,
                            }))
                            exportToExcel(monthlyData, "monthly_expenses_report", "Monthly Expenses", [
                              { header: "Month", key: "Month" },
                              { header: "Amount", key: "Amount" },
                            ])
                          }}
                        >
                          Download as Excel
                        </button>
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => {
                            const monthlyData = monthlyExpenseData.map((item) => ({
                              Month: item.month,
                              Amount: item.amount,
                            }))
                            exportToCSV(monthlyData, "monthly_expenses_report")
                          }}
                        >
                          Download as CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyExpenseData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(value) => `$${value / 1000}k`}
                        axisLine={false}
                        tickLine={false}
                        style={{ fontSize: "12px" }}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value as number), "Amount"]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          border: "none",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-3">
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Previously generated reports</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">{report.title}</p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Generated on {report.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                      onClick={() => handleDownloadReport(report.id)}
                      disabled={isDownloading === report.id}
                    >
                      {isDownloading === report.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" /> Download
                          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 hidden group-hover:block z-10">
                      <div className="py-1">
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => handleDownloadReport(report.id, "pdf")}
                        >
                          Download as PDF
                        </button>
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => handleDownloadReport(report.id, "excel")}
                        >
                          Download as Excel
                        </button>
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => handleDownloadReport(report.id, "csv")}
                        >
                          Download as CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
