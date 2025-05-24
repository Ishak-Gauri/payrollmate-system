import { getDatabase } from "@/lib/mongodb"
import type { TaxRate, TaxCalculationResult } from "@/lib/models/taxRate"
import type { Employee } from "@/lib/models/employee"
import { ObjectId } from "mongodb"

export class TaxCalculationService {
  private static async getTaxRatesCollection() {
    const db = await getDatabase()
    return db.collection<TaxRate>("taxRates")
  }

  static async getTaxRateByLocation(countryCode: string, regionCode?: string): Promise<TaxRate | null> {
    const collection = await this.getTaxRatesCollection()

    // Try to find a tax rate for the specific region first
    if (regionCode) {
      const regionTaxRate = await collection.findOne({
        countryCode,
        regionCode,
        isActive: true,
        effectiveDate: { $lte: new Date() },
        $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gt: new Date() } }],
      })

      if (regionTaxRate) return regionTaxRate
    }

    // Fall back to country-level tax rate
    return await collection.findOne({
      countryCode,
      regionCode: { $exists: false },
      isActive: true,
      effectiveDate: { $lte: new Date() },
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gt: new Date() } }],
    })
  }

  static async getAllTaxRates(filters?: {
    countryCode?: string
    isActive?: boolean
  }): Promise<TaxRate[]> {
    const collection = await this.getTaxRatesCollection()

    const query: any = {}

    if (filters?.countryCode) {
      query.countryCode = filters.countryCode
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive
    }

    return await collection.find(query).sort({ countryCode: 1, regionCode: 1 }).toArray()
  }

  static async createTaxRate(taxRate: Omit<TaxRate, "_id" | "createdAt" | "updatedAt">): Promise<TaxRate> {
    const collection = await this.getTaxRatesCollection()

    const newTaxRate: Omit<TaxRate, "_id"> = {
      ...taxRate,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newTaxRate as TaxRate)
    return { ...newTaxRate, _id: result.insertedId } as TaxRate
  }

  static async updateTaxRate(id: string, updates: Partial<TaxRate>): Promise<boolean> {
    const collection = await this.getTaxRatesCollection()
    const objectId = new ObjectId(id)

    const result = await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }

  static calculateIncomeTax(income: number, taxBrackets: TaxRate["incomeTaxRates"]): number {
    let remainingIncome = income
    let totalTax = 0

    // Sort tax brackets by minIncome (ascending)
    const sortedBrackets = [...taxBrackets].sort((a, b) => a.minIncome - b.minIncome)

    for (const bracket of sortedBrackets) {
      if (remainingIncome <= 0) break

      const bracketMax = bracket.maxIncome ?? Number.POSITIVE_INFINITY
      const bracketMin = bracket.minIncome
      const bracketSize = bracketMax - bracketMin

      const incomeInBracket = Math.min(remainingIncome, bracketSize > 0 ? bracketSize : remainingIncome)

      if (bracket.fixedAmount !== undefined) {
        // Fixed amount tax
        totalTax += bracket.fixedAmount
      } else {
        // Percentage-based tax
        totalTax += incomeInBracket * (bracket.rate / 100)
      }

      remainingIncome -= incomeInBracket
    }

    return totalTax
  }

  static async calculateTax(employee: Employee, grossIncome: number): Promise<TaxCalculationResult> {
    // Get applicable tax rate
    const taxRate = await this.getTaxRateByLocation(employee.location.countryCode, employee.location.regionCode)

    if (!taxRate) {
      throw new Error(
        `No tax rate found for location: ${employee.location.countryCode}, ${employee.location.regionCode || "N/A"}`,
      )
    }

    // Calculate income tax
    const incomeTax = this.calculateIncomeTax(grossIncome, taxRate.incomeTaxRates)

    // Calculate social security
    const socialSecurity = grossIncome * (taxRate.socialSecurityRate / 100)

    // Calculate employer contribution (not deducted from employee)
    const employerContribution = grossIncome * (taxRate.employerContributionRate / 100)

    // Calculate other deductions
    const otherDeductions = taxRate.otherDeductions.map((deduction) => {
      const amount = deduction.type === "percentage" ? grossIncome * (deduction.value / 100) : deduction.value

      // Apply maximum if specified
      const finalAmount = deduction.maxAmount !== undefined ? Math.min(amount, deduction.maxAmount) : amount

      return {
        name: deduction.name,
        amount: finalAmount,
      }
    })

    const totalOtherDeductions = otherDeductions.reduce((sum, d) => sum + d.amount, 0)

    // Apply any additional withholding from employee settings
    const additionalWithholding = employee.taxSettings?.additionalWithholding || 0

    // Calculate total deductions and net income
    const totalDeductions = incomeTax + socialSecurity + totalOtherDeductions + additionalWithholding
    const netIncome = grossIncome - totalDeductions

    // Calculate effective tax rate
    const effectiveTaxRate = (totalDeductions / grossIncome) * 100

    return {
      grossIncome,
      taxableIncome: grossIncome, // This could be adjusted based on pre-tax deductions
      incomeTax,
      socialSecurity,
      employerContribution,
      otherDeductions,
      totalDeductions,
      netIncome,
      effectiveTaxRate,
    }
  }

  static async getTaxRateById(id: string): Promise<TaxRate | null> {
    const collection = await this.getTaxRatesCollection()
    const objectId = new ObjectId(id)
    return await collection.findOne({ _id: objectId })
  }
}
