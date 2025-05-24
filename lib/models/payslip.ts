import type { ObjectId } from "mongodb"

export interface Payslip {
  _id?: ObjectId
  payslipId: string
  employeeId: string
  employeeName: string
  period: string
  date: Date
  grossAmount: number
  netAmount: number
  components: {
    basic: number
    hra: number
    specialAllowance: number
    [key: string]: number
  }
  deductions: {
    incomeTax?: number
    socialSecurity?: number
    pf?: number
    tds?: number
    otherDeductions?: Record<string, number>
    [key: string]: number | Record<string, number> | undefined
  }
  taxDetails?: {
    taxableIncome: number
    effectiveTaxRate: number
    employerContribution: number
    location: {
      countryCode: string
      regionCode?: string
    }
  }
  paymentId?: string
  status: "Generated" | "Paid" | "Failed"
  createdAt: Date
  updatedAt: Date
}
