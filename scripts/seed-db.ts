import clientPromise from "../lib/mongodb"
import { EmployeeService } from "../lib/services/employeeService"
import { PayrollService } from "../lib/services/payrollService"

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...")
    const client = await clientPromise
    const db = client.db("payrollmate")

    console.log("Connected successfully!")

    // Check if we already have data
    const employeesCount = await db.collection("employees").countDocuments()

    if (employeesCount > 0) {
      console.log(`Database already has ${employeesCount} employees. Skipping seed.`)
      return
    }

    console.log("Seeding database with sample data...")

    // Create sample employees
    const employees = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        department: "Engineering",
        position: "Senior Developer",
        salary: 85000,
        bankDetails: {
          accountNumber: "1234567890",
          bankName: "Chase Bank",
          routingNumber: "021000021",
        },
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        department: "Marketing",
        position: "Marketing Manager",
        salary: 75000,
        bankDetails: {
          accountNumber: "0987654321",
          bankName: "Bank of America",
          routingNumber: "026009593",
        },
      },
    ]

    for (const emp of employees) {
      await EmployeeService.createEmployee(emp)
      console.log(`Created employee: ${emp.name}`)
    }

    // Create a sample payroll
    const currentDate = new Date()
    const month = currentDate.toLocaleString("default", { month: "long" })
    const year = currentDate.getFullYear()

    const payroll = await PayrollService.createPayroll(`${month} ${year}`, currentDate)

    console.log(`Created payroll: ${payroll.payrollId}`)

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    process.exit(0)
  }
}

seedDatabase()
