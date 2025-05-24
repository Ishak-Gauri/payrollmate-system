import { getDatabase } from "@/lib/mongodb"
import type { Payroll, PayrollEmployee } from "@/lib/models/payroll"
import { EmployeeService } from "./employeeService"

export class PayrollService {
  private static async getCollection() {
    const db = await getDatabase()
    return db.collection<Payroll>("payrolls")
  }

  private static async getPayrollEmployeesCollection() {
    const db = await getDatabase()
    return db.collection<PayrollEmployee>("payroll_employees")
  }

  static async createPayroll(period: string, date: Date): Promise<Payroll> {
    try {
      const collection = await this.getCollection()

      // Generate payroll ID
      const count = await collection.countDocuments()
      const payrollId = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`

      // Get all active employees
      const employees = await EmployeeService.getAllEmployees({ status: "Active" })
      const totalAmount = employees.reduce((sum, emp) => sum + emp.salary, 0)

      const payroll: Payroll = {
        payrollId,
        period,
        date,
        employees: employees.length,
        totalAmount,
        status: "Pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await collection.insertOne(payroll)
      return { ...payroll, _id: result.insertedId }
    } catch (error) {
      console.error("Error creating payroll:", error)
      throw error
    }
  }

  static async getAllPayrolls(): Promise<Payroll[]> {
    try {
      const collection = await this.getCollection()
      const payrolls = await collection.find({}).sort({ createdAt: -1 }).toArray()
      console.log(`Found ${payrolls.length} payrolls`)
      return payrolls
    } catch (error) {
      console.error("Error fetching all payrolls:", error)
      // Return empty array as fallback
      return []
    }
  }

  static async getPayrollById(payrollId: string): Promise<Payroll | null> {
    try {
      const collection = await this.getCollection()

      console.log("Searching for payroll with ID:", payrollId)

      // Try to find by payrollId field first
      let payroll = await collection.findOne({ payrollId: payrollId })

      // If not found, try to find by MongoDB _id
      if (!payroll && payrollId.match(/^[0-9a-fA-F]{24}$/)) {
        const { ObjectId } = require("mongodb")
        payroll = await collection.findOne({ _id: new ObjectId(payrollId) })
      }

      if (!payroll) {
        console.log("No payroll found for ID:", payrollId)
        return null
      }

      console.log("Found payroll:", payroll.payrollId || payroll._id)
      return payroll
    } catch (error) {
      console.error("Error in getPayrollById:", error)
      throw error
    }
  }

  static async updatePayrollStatus(payrollId: string, status: Payroll["status"]): Promise<boolean> {
    try {
      const collection = await this.getCollection()

      const result = await collection.updateOne(
        { payrollId },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error updating payroll status:", error)
      throw error
    }
  }

  static async updatePayroll(payrollId: string, updates: Partial<Payroll>): Promise<Payroll | null> {
    try {
      const collection = await this.getCollection()

      // Add updatedAt timestamp
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      }

      // Try to update by payrollId field first
      let result = await collection.findOneAndUpdate(
        { payrollId: payrollId },
        { $set: updateData },
        { returnDocument: "after" },
      )

      // If not found, try to update by MongoDB _id
      if (!result.value && payrollId.match(/^[0-9a-fA-F]{24}$/)) {
        const { ObjectId } = require("mongodb")
        result = await collection.findOneAndUpdate(
          { _id: new ObjectId(payrollId) },
          { $set: updateData },
          { returnDocument: "after" },
        )
      }

      return result.value as Payroll
    } catch (error) {
      console.error("Error updating payroll:", error)
      throw error
    }
  }

  static async deletePayroll(payrollId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection()

      // Try to delete by payrollId field first
      let result = await collection.deleteOne({ payrollId: payrollId })

      // If not found, try to delete by MongoDB _id
      if (result.deletedCount === 0 && payrollId.match(/^[0-9a-fA-F]{24}$/)) {
        const { ObjectId } = require("mongodb")
        result = await collection.deleteOne({ _id: new ObjectId(payrollId) })
      }

      return result.deletedCount > 0
    } catch (error) {
      console.error("Error deleting payroll:", error)
      throw error
    }
  }

  static async getPayrollStats() {
    try {
      const collection = await this.getCollection()

      const currentMonth = new Date()
      currentMonth.setDate(1)

      const thisMonthPayrolls = await collection.countDocuments({
        createdAt: { $gte: currentMonth },
      })

      const totalPayrolls = await collection.countDocuments()

      const pipeline = [
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
            avgAmount: { $avg: "$totalAmount" },
          },
        },
      ]

      const stats = await collection.aggregate(pipeline).toArray()

      return {
        thisMonth: thisMonthPayrolls,
        total: totalPayrolls,
        totalAmount: stats[0]?.totalAmount || 0,
        avgAmount: stats[0]?.avgAmount || 0,
      }
    } catch (error) {
      console.error("Error getting payroll stats:", error)
      return {
        thisMonth: 0,
        total: 0,
        totalAmount: 0,
        avgAmount: 0,
      }
    }
  }

  static async processPayroll(payrollId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection()

      // Update payroll status to "Processing"
      await collection.updateOne(
        { payrollId },
        {
          $set: {
            status: "Processing",
            updatedAt: new Date(),
          },
        },
      )

      // Here you would typically:
      // 1. Generate payslips for all employees
      // 2. Send notifications
      // 3. Update status to "Completed"

      // For now, just update status to completed
      await collection.updateOne(
        { payrollId },
        {
          $set: {
            status: "Completed",
            processedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      )

      return true
    } catch (error) {
      console.error("Error processing payroll:", error)

      // Update status to "Failed" on error
      try {
        const collection = await this.getCollection()
        await collection.updateOne(
          { payrollId },
          {
            $set: {
              status: "Failed",
              updatedAt: new Date(),
            },
          },
        )
      } catch (updateError) {
        console.error("Error updating payroll status to failed:", updateError)
      }

      throw error
    }
  }
}
