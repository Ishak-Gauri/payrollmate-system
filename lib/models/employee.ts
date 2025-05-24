import type { ObjectId } from "mongodb"

export interface Employee {
  _id?: ObjectId
  employeeId: string
  name: string
  email: string
  department: string
  position: string
  salary: number
  status: "Active" | "Inactive" | "On Leave"
  bankDetails: {
    accountNumber: string
    bankName: string
    routingNumber?: string
    ifscCode?: string
  }
  location: {
    countryCode: string
    regionCode?: string
    city?: string
    postalCode?: string
    address?: string
  }
  taxIdentifiers: {
    ssn?: string
    taxId?: string
    panNumber?: string
    nationalId?: string
  }
  taxSettings: {
    additionalWithholding?: number
    taxExemptions?: number
    specialTaxStatus?: string
  }
  stripeAccountId?: string
  joinDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateEmployeeData {
  name: string
  email: string
  department: string
  position: string
  salary: number
  bankDetails: {
    accountNumber: string
    bankName: string
    routingNumber?: string
    ifscCode?: string
  }
  location: {
    countryCode: string
    regionCode?: string
    city?: string
    postalCode?: string
    address?: string
  }
  taxIdentifiers?: {
    ssn?: string
    taxId?: string
    panNumber?: string
    nationalId?: string
  }
  taxSettings?: {
    additionalWithholding?: number
    taxExemptions?: number
    specialTaxStatus?: string
  }
}
