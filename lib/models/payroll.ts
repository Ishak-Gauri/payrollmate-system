import type { ObjectId } from "mongodb"

export interface Payroll {
  _id?: ObjectId
  payrollId: string
  period: string
  date: Date
  employees: number
  totalAmount: number
  status: "Pending" | "Processing" | "Completed" | "Failed"
  processedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface PayrollEmployee {
  employeeId: string
  grossSalary: number
  netSalary: number
  deductions: {
    pf: number
    tax: number
    insurance?: number
    other?: number
  }
  stripeTransferId?: string
  status: "Pending" | "Processed" | "Failed"
}
