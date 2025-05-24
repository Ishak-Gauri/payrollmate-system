"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, DollarSign, Clock, ArrowRight, Download, Eye, User, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { Payslip } from "@/lib/models/payslip"

export default function EmployeePortalDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [recentPayslips, setRecentPayslips] = useState<Payslip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [upcomingPayday, setUpcomingPayday] = useState<string>("")

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return

      try {
        // Fetch employee payslips
        const response = await fetch(`/api/payslips/employee/${session.user.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch payslips")
        }
        const data = await response.json()
        setRecentPayslips(data.slice(0, 3)) // Get only the 3 most recent payslips

        // Calculate upcoming payday (just a placeholder - in a real app this would come from the backend)
        const today = new Date()
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        const upcomingPayday = new Date(lastDayOfMonth)

        // If today is after the 25th, show next month's payday
        if (today.getDate() > 25) {
          upcomingPayday.setMonth(upcomingPayday.getMonth() + 1)
        }

        setUpcomingPayday(
          upcomingPayday.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        )
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch your data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchData()
    }
  }, [session, toast])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-[300px]"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded w-[600px]"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
          Welcome, {session?.user?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Access your payslips and personal information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Next Payday
            </CardTitle>
            <CardDescription>Your upcoming payment date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{upcomingPayday}</div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                Scheduled
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-blue-500" />
              Last Payment
            </CardTitle>
            <CardDescription>Your most recent payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              {recentPayslips.length > 0 ? (
                <>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    {formatCurrency(recentPayslips[0].netAmount)}
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    {recentPayslips[0].period}
                  </Badge>
                </>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">No payments yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Payslips
            </CardTitle>
            <CardDescription>Your payslip documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {recentPayslips.length}
              </div>
              <Button
                variant="outline"
                className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                onClick={() => router.push("/portal/payslips")}
              >
                View All Payslips
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="recent">Recent Payslips</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="recent">
          <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle>Recent Payslips</CardTitle>
              <CardDescription>Your most recent payslip documents</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPayslips.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No payslips found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPayslips.map((payslip) => (
                    <div
                      key={payslip.payslipId}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-500 mr-2" />
                          <p className="font-medium">{payslip.period}</p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Paid on {formatDate(payslip.date.toString())}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                          {payslip.status}
                        </Badge>
                        <span className="font-medium">{formatCurrency(payslip.netAmount)}</span>
                      </div>
                      <div className="flex space-x-2 mt-4 md:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          onClick={() => router.push(`/portal/payslips/${payslip.payslipId}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-center mt-6">
                    <Button
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white"
                      onClick={() => router.push("/portal/payslips")}
                    >
                      View All Payslips
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upcoming">
          <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>Your scheduled future payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Clock className="h-16 w-16 mx-auto text-indigo-300 dark:text-indigo-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Next Payment Scheduled</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Your next payment is scheduled for {upcomingPayday}
                  </p>
                  <div className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Mark your calendar</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800 mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Frequently used resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={() => router.push("/portal/payslips")}
            >
              <FileText className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">View All Payslips</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={() => router.push("/portal/profile")}
            >
              <User className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Update Profile</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={() => {
                toast({
                  title: "Help Center",
                  description: "The help center is coming soon!",
                })
              }}
            >
              <Settings className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Help Center</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
