import type { Employee } from "@/lib/models/employee"
import type { Payroll } from "@/lib/models/payroll"
import type { Payslip } from "@/lib/models/payslip"
import Papa from "papaparse"
import ExcelJS from "exceljs"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

// Helper to format date for exports
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Helper to sanitize employee data for export (remove sensitive info)
const sanitizeEmployeeForExport = (employee: Employee, includeFields: string[]) => {
  const sanitized: Record<string, any> = {}

  // Only include requested fields
  includeFields.forEach((field) => {
    if (field === "bankDetails") {
      // Special handling for bank details to mask account number
      sanitized.bankName = employee.bankDetails?.bankName || ""
      sanitized.accountNumber = employee.bankDetails?.accountNumber
        ? `****${employee.bankDetails.accountNumber.slice(-4)}`
        : ""
    } else if (field === "joinDate" || field === "createdAt" || field === "updatedAt") {
      // Format dates
      sanitized[field] = employee[field] ? formatDate(employee[field] as Date) : ""
    } else {
      // Regular fields
      sanitized[field] = employee[field as keyof Employee] || ""
    }
  })

  return sanitized
}

// Helper to prepare payroll data for export
const preparePayrollForExport = (payroll: Payroll, includeFields: string[]) => {
  const prepared: Record<string, any> = {}

  includeFields.forEach((field) => {
    if (field === "date" || field === "createdAt" || field === "updatedAt") {
      // Format dates
      prepared[field] = payroll[field] ? formatDate(payroll[field] as Date) : ""
    } else if (field === "totalAmount") {
      // Format currency
      prepared[field] = `$${payroll.totalAmount.toLocaleString()}`
    } else {
      // Regular fields
      prepared[field] = payroll[field as keyof Payroll] || ""
    }
  })

  return prepared
}

// Export to CSV
export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  // Create download link and trigger click
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export to Excel
export const exportToExcel = async (
  data: any[],
  filename: string,
  sheetName: string,
  columns: { header: string; key: string }[],
) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  // Add header row
  worksheet.columns = columns

  // Add data rows
  worksheet.addRows(data)

  // Style the header row
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  }

  // Auto-size columns
  worksheet.columns.forEach((column) => {
    let maxLength = 0
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10
      if (columnLength > maxLength) {
        maxLength = columnLength
      }
    })
    column.width = maxLength < 10 ? 10 : maxLength + 2
  })

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()

  // Create blob and download
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `${filename}.xlsx`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export to PDF
export const exportToPDF = (
  data: any[],
  filename: string,
  title: string,
  columns: { header: string; dataKey: string }[],
) => {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(11)
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30)

  // Add table
  autoTable(doc, {
    startY: 35,
    head: [columns.map((col) => col.header)],
    body: data.map((item) => columns.map((col) => item[col.dataKey] || "")),
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 35 },
  })

  // Save PDF
  doc.save(`${filename}.pdf`)
}

// Export employees
export const exportEmployees = (
  employees: Employee[],
  format: "csv" | "excel" | "pdf",
  includeFields: (keyof Employee | "bankName" | "accountNumber")[],
) => {
  // Prepare data
  const data = employees.map((emp) => sanitizeEmployeeForExport(emp, includeFields as string[]))

  // Define column configurations
  const columns = includeFields.map((field) => {
    // Convert camelCase to Title Case for headers
    const header = field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

    return {
      header,
      key: field as string,
      dataKey: field as string,
    }
  })

  // Export based on format
  if (format === "csv") {
    exportToCSV(data, "employees_export")
  } else if (format === "excel") {
    exportToExcel(data, "employees_export", "Employees", columns)
  } else if (format === "pdf") {
    exportToPDF(data, "employees_export", "Employee Report", columns)
  }
}

// Export payrolls
export const exportPayrolls = (
  payrolls: Payroll[],
  format: "csv" | "excel" | "pdf",
  includeFields: (keyof Payroll)[],
) => {
  // Prepare data
  const data = payrolls.map((payroll) => preparePayrollForExport(payroll, includeFields as string[]))

  // Define column configurations
  const columns = includeFields.map((field) => {
    // Convert camelCase to Title Case for headers
    const header = field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

    return {
      header,
      key: field as string,
      dataKey: field as string,
    }
  })

  // Export based on format
  if (format === "csv") {
    exportToCSV(data, "payrolls_export")
  } else if (format === "excel") {
    exportToExcel(data, "payrolls_export", "Payrolls", columns)
  } else if (format === "pdf") {
    exportToPDF(data, "payrolls_export", "Payroll Report", columns)
  }
}

// Export payslips
export const exportPayslips = (
  payslips: Payslip[],
  format: "csv" | "excel" | "pdf",
  includeFields: (keyof Payslip)[],
) => {
  // Prepare data
  const data = payslips.map((payslip) => {
    const prepared: Record<string, any> = {}

    includeFields.forEach((field) => {
      if (field === "date" || field === "createdAt") {
        // Format dates
        prepared[field] = payslip[field] ? formatDate(payslip[field] as Date) : ""
      } else if (field === "grossAmount" || field === "netAmount" || field === "deductions") {
        // Format currency
        prepared[field] = `$${(payslip[field] as number).toLocaleString()}`
      } else {
        // Regular fields
        prepared[field] = payslip[field as keyof Payslip] || ""
      }
    })

    return prepared
  })

  // Define column configurations
  const columns = includeFields.map((field) => {
    // Convert camelCase to Title Case for headers
    const header = field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

    return {
      header,
      key: field as string,
      dataKey: field as string,
    }
  })

  // Export based on format
  if (format === "csv") {
    exportToCSV(data, "payslips_export")
  } else if (format === "excel") {
    exportToExcel(data, "payslips_export", "Payslips", columns)
  } else if (format === "pdf") {
    exportToPDF(data, "payslips_export", "Payslip Report", columns)
  }
}
