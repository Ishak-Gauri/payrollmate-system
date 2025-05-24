"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

interface Payslip {
  id: string
  employeeId: string
  payPeriodStart: string
  payPeriodEnd: string
  grossPay: number
  netPay: number
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  position: string
  hireDate: string
}

export default function EmployeePayslipsPage({ params }: { params: { employeeId: string } }) {
  // Unwrap the params object using React.use()
  const unwrappedParams = React.use(params)

  const router = useRouter()
  const { toast } = useToast()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [generatingPayslipId, setGeneratingPayslipId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch employee details
        const employeeResponse = await fetch(`/api/employees/${unwrappedParams.employeeId}`)
        if (!employeeResponse.ok) {
          throw new Error("Failed to fetch employee details")
        }
        const employeeData = await employeeResponse.json()
        setEmployee(employeeData)

        // Fetch employee payslips
        const payslipsResponse = await fetch(`/api/payslips/employee/${unwrappedParams.employeeId}`)
        if (!payslipsResponse.ok) {
          throw new Error("Failed to fetch payslips")
        }
        const payslipsData = await payslipsResponse.json()
        setPayslips(payslipsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [unwrappedParams.employeeId, toast])

  const employeeId = unwrappedParams.employeeId

  // Continue with the rest of the component using employeeId instead of params.employeeId
  return (
    <div>
      <h1>Employee Payslips</h1>
      <p>Employee ID: {employeeId}</p>
      {/* Add your payslip listing or details here, fetching data using employeeId */}
    </div>
  )
}
