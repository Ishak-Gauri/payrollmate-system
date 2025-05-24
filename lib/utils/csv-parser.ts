import { parse } from "papaparse"
import { z } from "zod"
import type { CreateEmployeeData } from "@/lib/models/employee"

// Schema for validating employee CSV data
const employeeCsvSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  salary: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Salary must be a positive number"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(5, "Account number is required"),
  routingNumber: z.string().optional(),
})

export type EmployeeCsvData = z.infer<typeof employeeCsvSchema>

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string[]>
  data: EmployeeCsvData[]
}

export interface ParseResult {
  success: boolean
  message?: string
  validation?: ValidationResult
  transformedData?: CreateEmployeeData[]
}

export async function parseEmployeeCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          resolve({
            success: false,
            message: `CSV parsing error: ${results.errors[0].message}`,
          })
          return
        }

        const data = results.data as Record<string, string>[]

        if (data.length === 0) {
          resolve({
            success: false,
            message: "The CSV file is empty",
          })
          return
        }

        // Check if required headers exist
        const requiredHeaders = ["name", "email", "department", "position", "salary", "bankName", "accountNumber"]
        const headers = Object.keys(data[0])
        const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

        if (missingHeaders.length > 0) {
          resolve({
            success: false,
            message: `Missing required columns: ${missingHeaders.join(", ")}`,
          })
          return
        }

        // Validate each row
        const validationResult: ValidationResult = {
          valid: true,
          errors: {},
          data: [],
        }

        data.forEach((row, index) => {
          try {
            const validatedRow = employeeCsvSchema.parse(row)
            validationResult.data.push(validatedRow)
          } catch (error) {
            validationResult.valid = false
            if (error instanceof z.ZodError) {
              validationResult.errors[index] = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`)
            }
          }
        })

        // Transform data to CreateEmployeeData format
        const transformedData: CreateEmployeeData[] = validationResult.data.map((row) => ({
          name: row.name,
          email: row.email,
          department: row.department,
          position: row.position,
          salary: Number(row.salary),
          bankDetails: {
            bankName: row.bankName,
            accountNumber: row.accountNumber,
            routingNumber: row.routingNumber,
          },
        }))

        resolve({
          success: true,
          validation: validationResult,
          transformedData,
        })
      },
      error: (error) => {
        resolve({
          success: false,
          message: `Failed to parse CSV: ${error.message}`,
        })
      },
    })
  })
}

export function generateCsvTemplate(): string {
  const headers = ["name", "email", "department", "position", "salary", "bankName", "accountNumber", "routingNumber"]
  const sampleRow = [
    "John Doe",
    "john.doe@example.com",
    "Engineering",
    "Software Engineer",
    "75000",
    "Bank of America",
    "1234567890",
    "021000021",
  ]

  return [headers.join(","), sampleRow.join(",")].join("\n")
}
