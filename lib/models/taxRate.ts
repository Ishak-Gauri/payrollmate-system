import type { ObjectId } from "mongodb"

export interface TaxRate {
  _id?: ObjectId
  countryCode: string
  regionCode?: string
  name: string
  description?: string
  incomeTaxRates: TaxBracket[]
  socialSecurityRate: number
  employerContributionRate: number
  otherDeductions: OtherDeduction[]
  currency: string
  effectiveDate: Date
  expiryDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TaxBracket {
  minIncome: number
  maxIncome?: number
  rate: number
  fixedAmount?: number
}

export interface OtherDeduction {
  name: string
  type: "percentage" | "fixed"
  value: number
  maxAmount?: number
  isRequired: boolean
}

export interface TaxCalculationResult {
  grossIncome: number
  taxableIncome: number
  incomeTax: number
  socialSecurity: number
  employerContribution: number
  otherDeductions: {
    name: string
    amount: number
  }[]
  totalDeductions: number
  netIncome: number
  effectiveTaxRate: number
}
