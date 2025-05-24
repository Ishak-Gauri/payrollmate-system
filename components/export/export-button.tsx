"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExportDialog } from "./export-dialog"
import { FileDown } from "lucide-react"
import { exportEmployees, exportPayrolls, exportPayslips } from "@/lib/utils/export-utils"
import type { Employee } from "@/lib/models/employee"
import type { Payroll } from "@/lib/models/payroll"
import type { Payslip } from "@/lib/models/payslip"

interface ExportButtonProps {
  data: Employee[] | Payroll[] | Payslip[]
  type: "employees" | "payrolls" | "payslips"
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function ExportButton({ data, type, variant = "outline" }: ExportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleExport = (format: string, fields: string[]) => {
    if (type === "employees") {
      exportEmployees(data as Employee[], format as "csv" | "excel" | "pdf", fields as any)
    } else if (type === "payrolls") {
      exportPayrolls(data as Payroll[], format as "csv" | "excel" | "pdf", fields as any)
    } else if (type === "payslips") {
      exportPayslips(data as Payslip[], format as "csv" | "excel" | "pdf", fields as any)
    }
  }

  const getDialogProps = () => {
    switch (type) {
      case "employees":
        return {
          title: "Export Employees",
          description: "Select the format and fields to include in your employee export.",
        }
      case "payrolls":
        return {
          title: "Export Payrolls",
          description: "Select the format and fields to include in your payroll export.",
        }
      case "payslips":
        return {
          title: "Export Payslips",
          description: "Select the format and fields to include in your payslip export.",
        }
      default:
        return {
          title: "Export Data",
          description: "Select the format and fields to include in your export.",
        }
    }
  }

  return (
    <>
      <Button variant={variant} onClick={() => setDialogOpen(true)}>
        <FileDown className="mr-2 h-4 w-4" />
        Export
      </Button>

      <ExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onExport={handleExport}
        type={type}
        {...getDialogProps()}
      />
    </>
  )
}
