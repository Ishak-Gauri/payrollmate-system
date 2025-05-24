import { getDatabase } from "@/lib/mongodb"
import type { Employee, CreateEmployeeData } from "@/lib/models/employee"

export class EmployeeService {
  private static async getCollection() {
    const db = await getDatabase()
    return db.collection<Employee>("employees")
  }

  static async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    const collection = await this.getCollection()

    // Generate employee ID
    const count = await collection.countDocuments()
    const employeeId = `EMP-${String(count + 1).padStart(4, "0")}`

    const employee: Employee = {
      employeeId,
      name: data.name,
      email: data.email,
      department: data.department,
      position: data.position,
      salary: data.salary,
      status: "Active",
      bankDetails: data.bankDetails,
      location: data.location,
      taxIdentifiers: data.taxIdentifiers || {},
      taxSettings: data.taxSettings || {},
      joinDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(employee)
    return { ...employee, _id: result.insertedId }
  }

  static async getEmployeeById(id: string): Promise<Employee | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ employeeId: id })
  }

  static async getEmployeeByEmail(email: string): Promise<Employee | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ email })
  }

  static async getAllEmployees(filters?: {
    status?: "Active" | "Inactive" | "On Leave"
    department?: string
    countryCode?: string
  }): Promise<Employee[]> {
    const collection = await this.getCollection()

    const query: any = {}

    if (filters?.status) {
      query.status = filters.status
    }

    if (filters?.department) {
      query.department = filters.department
    }

    if (filters?.countryCode) {
      query["location.countryCode"] = filters.countryCode
    }

    return await collection.find(query).sort({ name: 1 }).toArray()
  }

  static async updateEmployee(id: string, updates: Partial<Employee>): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { employeeId: id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }

  static async deleteEmployee(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ employeeId: id })
    return result.deletedCount > 0
  }

  static async updateEmployeeStatus(id: string, status: Employee["status"]): Promise<boolean> {
    return this.updateEmployee(id, { status })
  }

  static async updateStripeAccountId(id: string, stripeAccountId: string): Promise<boolean> {
    return this.updateEmployee(id, { stripeAccountId })
  }
}
