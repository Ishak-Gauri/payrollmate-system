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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, MoreHorizontal, Plus, Search, UserPlus, FileText, Upload, Users, TrendingUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ExportButton } from "@/components/export/export-button"
import type { Employee } from "@/lib/models/employee"

export default function EmployeesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchEmployees() {
      setIsLoading(true)
      try {
        let url = "/api/employees"
        const params = new URLSearchParams()

        if (searchQuery) params.append("search", searchQuery)
        if (departmentFilter !== "all") params.append("department", departmentFilter)
        if (statusFilter !== "all") params.append("status", statusFilter)

        if (params.toString()) {
          url += `?${params.toString()}`
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch employees")

        const data = await response.json()

        // Ensure data is an array
        if (Array.isArray(data)) {
          setEmployees(data)
        } else if (data && Array.isArray(data.employees)) {
          setEmployees(data.employees)
        } else {
          console.warn("API returned non-array data:", data)
          setEmployees([])
        }
      } catch (error) {
        console.error("Error fetching employees:", error)
        setEmployees([]) // Set to empty array on error
        toast({
          title: "Error",
          description: "Failed to fetch employees. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [searchQuery, departmentFilter, statusFilter, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "Inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const handleViewDetails = (employeeId: string) => {
    router.push(`/employees/${employeeId}`)
  }

  const handleEditEmployee = (employeeId: string) => {
    router.push(`/employees/edit/${employeeId}`)
  }

  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/employees/${employeeToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete employee")
      }

      // Remove the deleted employee from the state
      setEmployees(employees.filter((emp) => emp.employeeId !== employeeToDelete))

      toast({
        title: "Employee Deleted",
        description: "The employee has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
    }
  }

  const handleViewPayslips = (employeeId: string) => {
    router.push(`/payslips/employee/${employeeId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Employee Management
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">Manage your team with ease and efficiency</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{employees.length} Total Employees</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>{employees.filter((emp) => emp.status === "Active").length} Active</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/employees/import")}
                className="hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-sm"
              >
                <Upload className="mr-2 h-4 w-4" /> Import CSV
              </Button>
              <ExportButton data={employees} type="employees" />
              <Button
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => router.push("/employees/add")}
              >
                <UserPlus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border-none shadow-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Employee Directory</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Search, filter, and manage all your employees in one place
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees by name, ID, or position..."
                  className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[200px] h-12 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] h-12 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading employees...</p>
                </div>
              </div>
            ) : employees.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No employees found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchQuery || departmentFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search criteria or filters"
                    : "Get started by adding your first employee to the system"}
                </p>
                <Button
                  onClick={() => router.push("/employees/add")}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add First Employee
                </Button>
              </div>
            ) : (
              /* Employee Table */
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Employee ID</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Name</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Department</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Position</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Salary</TableHead>
                      <TableHead className="text-right font-semibold text-gray-900 dark:text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow
                        key={employee.employeeId}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors duration-150"
                      >
                        <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                          {employee.employeeId}
                        </TableCell>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
                            {employee.department}
                          </span>
                        </TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">${employee.salary.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(employee.employeeId)}
                                className="cursor-pointer"
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditEmployee(employee.employeeId)}
                                className="cursor-pointer"
                              >
                                Edit Employee
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleViewPayslips(employee.employeeId)}
                                className="cursor-pointer"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View Payslips
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400"
                                onClick={() => handleDeleteClick(employee.employeeId)}
                              >
                                Delete Employee
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the employee and all associated data
                including payslips and payroll history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEmployee}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Employee"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
