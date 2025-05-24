"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

type Payslip = {
  id: string
  employeeId: string
  payPeriodStart: string
  payPeriodEnd: string
  paymentDate: string
  grossPay: number
  netPay: number
  deductions: {
    name: string
    amount: number
  }[]
  earnings: {
    name: string
    amount: number
  }[]
}

export default function EmployeePayslipDetailPage({ params }: { params: { id: string } }) {
  // Unwrap the params object using React.use()
  const unwrappedParams = React.use(params)

  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [payslip, setPayslip] = useState<Payslip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [payslipId, setPayslipId] = useState<string>("")

  // Set the payslip ID from params once on component mount
  useEffect(() => {
    if (unwrappedParams?.id) {
      setPayslipId(unwrappedParams.id)
    }
  }, [unwrappedParams])

  useEffect(() => {
    async function fetchPayslip() {
      if (!session?.user?.id || !payslipId) return

      try {
        const response = await fetch(`/api/payslips/${payslipId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch payslip")
        }
        const data = await response.json()

        // Verify this payslip belongs to the current user
        if (data.employeeId !== session.user.id) {
          toast({
            title: "Access Denied",
            description: "You do not have permission to view this payslip.",
            variant: "destructive",
          })
          router.push("/portal/payslips")
          return
        }

        setPayslip(data)
      } catch (error) {
        console.error("Error fetching payslip:", error)
        toast({
          title: "Error",
          description: "Failed to fetch payslip details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id && payslipId) {
      fetchPayslip()
    }
  }, [payslipId, session, toast, router])

  const id = unwrappedParams.id

  // Continue with the rest of the component using id instead of params.id
  return (
    <div>
      <h1>Payslip Detail Page</h1>
      <p>Payslip ID: {id}</p>
      {/* Add more content here to display payslip details */}
    </div>
  )
}
