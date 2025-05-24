"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  DollarSign,
  FileText,
  BarChart3,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  Mail,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react"
import {
  AreaChart,
  Area,
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
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

// Sample data for charts
const payrollData = [
  { month: "Jan", amount: 42000 },
  { month: "Feb", amount: 45000 },
  { month: "Mar", amount: 48000 },
  { month: "Apr", amount: 51000 },
  { month: "May", amount: 53000 },
  { month: "Jun", amount: 55000 },
]

const departmentData = [
  { name: "Engineering", value: 12 },
  { name: "Marketing", value: 8 },
  { name: "Sales", value: 10 },
  { name: "Finance", value: 5 },
  { name: "HR", value: 3 },
]

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"]

export default function HomePage() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    employees: { total: 38, active: 35, departments: 5 },
    payroll: { thisMonth: 1, total: 6, totalAmount: 294000, avgAmount: 49000 },
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setStats({
          employees: { total: 38, active: 35, departments: 5 },
          payroll: { thisMonth: 1, total: 6, totalAmount: 294000, avgAmount: 49000 },
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const quickActions = [
    {
      title: "Verify Email Setup",
      description: "Test your email notification configuration",
      icon: Mail,
      href: "/setup/verify-email",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    },
    {
      title: "Add New Employee",
      description: "Quickly onboard a new team member",
      icon: Users,
      href: "/employees/add",
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    },
    {
      title: "Process Payroll",
      description: "Run payroll for the current period",
      icon: DollarSign,
      href: "/payroll/create",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    },
    {
      title: "Generate Reports",
      description: "Create detailed payroll reports",
      icon: BarChart3,
      href: "/reports",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
                    Dashboard
                  </h1>
                  <p className="text-2xl text-gray-600 dark:text-gray-300 mt-2">
                    Welcome to PayrollMate - Your complete payroll management solution
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Period</p>
                <p className="font-semibold text-lg">June 2023</p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                PM
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                <Link href={action.href}>
                  <CardContent
                    className={`p-6 bg-gradient-to-br ${action.bgColor} group-hover:scale-105 transition-transform duration-300`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-r ${action.color} rounded-xl shadow-lg`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.employees.total}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>+2 this month</span>
              </div>
              <Progress value={92} className="h-2 mt-4" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">92% active employees</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.payroll.avgAmount)}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+5% from last month</span>
              </div>
              <div className="mt-4 flex items-center">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-[75%]"></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">75%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payslips Generated</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.employees.total * stats.payroll.total}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <Shield className="h-3 w-3 mr-1" />
                <span>All up to date</span>
              </div>
              <div className="mt-4 grid grid-cols-6 gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full ${
                      i < 5 ? "bg-gradient-to-r from-purple-500 to-indigo-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">5/6 months completed</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Payrolls</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.payroll.thisMonth}</div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>For {new Date().toLocaleString("default", { month: "long" })}</span>
              </div>
              <div className="mt-4 flex items-center space-x-1">
                <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
                  JD
                </div>
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  TK
                </div>
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                  AS
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-bold">
                  +35
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="mb-12">
          <TabsList className="mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl h-12">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md rounded-lg transition-all px-6 py-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="payroll"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md rounded-lg transition-all px-6 py-2"
            >
              Payroll History
            </TabsTrigger>
            <TabsTrigger
              value="employees"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md rounded-lg transition-all px-6 py-2"
            >
              Employee Stats
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card className="border-none shadow-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-gray-700 pb-4">
                <CardTitle className="text-2xl">Payroll Overview</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Monthly payroll amounts for the current year
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={payrollData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                        formatter={(value) => [`$${value}`, "Amount"]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
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
          <TabsContent value="payroll">
            <Card className="border-none shadow-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-100 dark:border-gray-700 pb-4">
                <CardTitle className="text-2xl">Payroll History</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Monthly payroll distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={payrollData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(value) => `$${value / 1000}k`}
                        axisLine={false}
                        tickLine={false}
                        style={{ fontSize: "12px" }}
                      />
                      <Tooltip
                        formatter={(value) => [`$${value}`, "Amount"]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                          border: "none",
                        }}
                      />
                      <Bar
                        dataKey="amount"
                        radius={[6, 6, 0, 0]}
                        background={{ fill: "#f9fafb" }}
                        fill="url(#barGradient)"
                      >
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#34d399" />
                          </linearGradient>
                        </defs>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="employees">
            <Card className="border-none shadow-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-100 dark:border-gray-700 pb-4">
                <CardTitle className="text-2xl">Employee Distribution</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Employees by department</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} employees`, "Count"]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                          border: "none",
                        }}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={12}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* API Testing Section */}
        <Card className="border-none shadow-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-2xl">System Status & API Testing</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Test your MongoDB connection and API endpoints to ensure everything is working correctly.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-12 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => {
                  toast({
                    title: "Testing Database Connection",
                    description: "Checking connection to MongoDB...",
                  })
                  window.open("/api/test-db", "_blank")
                }}
              >
                Test Database
              </Button>
              <Button
                variant="outline"
                className="h-12 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => {
                  window.open("/api/employees", "_blank")
                }}
              >
                Employees API
              </Button>
              <Button
                variant="outline"
                className="h-12 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => {
                  window.open("/api/payroll", "_blank")
                }}
              >
                Payroll API
              </Button>
              <Button
                variant="outline"
                className="h-12 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => {
                  window.open("/api/dashboard/stats", "_blank")
                }}
              >
                Dashboard Stats
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
