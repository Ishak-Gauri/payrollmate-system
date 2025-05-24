"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { Employee } from "@/types/employee" // Declare the Employee type

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  // Unwrap the params object using React.use()
  const unwrappedParams = React.use(params)

  const router = useRouter()
  const { toast } = useToast()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEmployee() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/employees/${unwrappedParams.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch employee details")
        }
        const data = await response.json()
        setEmployee(data)
      } catch (error) {
        console.error("Error fetching employee:", error)
        toast({
          title: "Error",
          description: "Failed to fetch employee details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployee()
  }, [unwrappedParams.id, toast])

  const handleViewPayslips = () => {
    if (employee) {
      router.push(`/payslips/employee/${employee.employeeId}`)
    }
  }

  const id = unwrappedParams.id

  // Continue with the rest of the component using id instead of params.id
  return (
    <div>
      <h1>Employee Detail Page</h1>
      <p>Employee ID: {id}</p>
    </div>
  )
}
