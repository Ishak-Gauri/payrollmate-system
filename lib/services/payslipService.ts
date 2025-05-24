import { getDatabase } from "@/lib/mongodb"
import type { Payslip } from "@/lib/models/payslip"
import type { Employee } from "@/lib/models/employee"
import { TaxCalculationService } from "@/lib/services/taxCalculationService"

export class PayslipService {
  private static async getCollection() {
    const db = await getDatabase()
    return db.collection<Payslip>("payslips")
  }

  static async createPayslip(employee: Employee, period: string, date: Date): Promise<Payslip> {
    const collection = await this.getCollection()

    // Generate payslip ID
    const count = await collection.countDocuments()
    const payslipId = `PS-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`

    // Calculate salary components
    const basic = employee.salary * 0.6
    const hra = employee.salary * 0.24
    const specialAllowance = employee.salary * 0.16
    const grossAmount = basic + hra + specialAllowance

    // Calculate taxes and deductions using the tax calculation service
    let taxCalculation
    try {
      taxCalculation = await TaxCalculationService.calculateTax(employee, grossAmount)
    } catch (error) {
      console.error("Error calculating taxes:", error)
      // Fall back to simplified calculation if tax calculation fails
      const pf = grossAmount * 0.072 // 7.2% PF
      const tds = grossAmount * 0.18 // 18% TDS (simplified)
      const totalDeductions = pf + tds
      const netAmount = grossAmount - totalDeductions

      const payslip: Payslip = {
        payslipId,
        employeeId: employee.employeeId,
        employeeName: employee.name,
        period,
        date,
        grossAmount,
        netAmount,
        components: {
          basic,
          hra,
          specialAllowance,
        },
        deductions: {
          pf,
          tds,
        },
        status: "Generated",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await collection.insertOne(payslip)
      return { ...payslip, _id: result.insertedId }
    }

    // Create payslip with detailed tax information
    const payslip: Payslip = {
      payslipId,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      period,
      date,
      grossAmount,
      netAmount: taxCalculation.netIncome,
      components: {
        basic,
        hra,
        specialAllowance,
      },
      deductions: {
        incomeTax: taxCalculation.incomeTax,
        socialSecurity: taxCalculation.socialSecurity,
        otherDeductions: taxCalculation.otherDeductions.reduce(
          (obj, item) => {
            obj[item.name] = item.amount
            return obj
          },
          {} as Record<string, number>,
        ),
      },
      taxDetails: {
        taxableIncome: taxCalculation.taxableIncome,
        effectiveTaxRate: taxCalculation.effectiveTaxRate,
        employerContribution: taxCalculation.employerContribution,
        location: {
          countryCode: employee.location.countryCode,
          regionCode: employee.location.regionCode,
        },
      },
      status: "Generated",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(payslip)
    return { ...payslip, _id: result.insertedId }
  }

  // Other methods remain the same
  static async getPayslipsByEmployee(employeeId: string): Promise<Payslip[]> {
    const collection = await this.getCollection()
    return await collection.find({ employeeId }).sort({ date: -1 }).toArray()
  }

  static async getAllPayslips(filters?: {
    period?: string
    employeeId?: string
    status?: string
  }): Promise<Payslip[]> {
    const collection = await this.getCollection()

    const query: any = {}

    if (filters?.period) {
      query.period = filters.period
    }

    if (filters?.employeeId) {
      query.employeeId = filters.employeeId
    }

    if (filters?.status) {
      query.status = filters.status
    }

    return await collection.find(query).sort({ date: -1 }).toArray()
  }

  static async updatePayslipStatus(payslipId: string, status: Payslip["status"], paymentId?: string): Promise<boolean> {
    const collection = await this.getCollection()

    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    if (paymentId) {
      updateData.paymentId = paymentId
    }

    const result = await collection.updateOne({ payslipId }, { $set: updateData })

    return result.modifiedCount > 0
  }

  static async getPayslipById(payslipId: string): Promise<Payslip | null> {
    const collection = await this.getCollection()

    try {
      // Try to find by payslipId field first
      let payslip = await collection.findOne({ payslipId })

      // If not found, try to find by MongoDB _id
      if (!payslip) {
        try {
          const { ObjectId } = await import("mongodb")
          payslip = await collection.findOne({ _id: new ObjectId(payslipId) })
        } catch (error) {
          // If ObjectId conversion fails, payslip remains null
          console.log("Invalid ObjectId format, payslip not found")
        }
      }

      return payslip
    } catch (error) {
      console.error("Error fetching payslip by ID:", error)
      throw error
    }
  }
}
