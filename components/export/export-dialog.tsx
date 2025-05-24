"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileDown, FileText, Table, FileSpreadsheet } from "lucide-react"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: string, fields: string[]) => void
  type: "employees" | "payrolls" | "payslips"
  title: string
  description: string
}

export function ExportDialog({ open, onOpenChange, onExport, type, title, description }: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Define available fields based on export type
  const availableFields = {
    employees: [
      { id: "employeeId", label: "Employee ID" },
      { id: "name", label: "Name" },
      { id: "email", label: "Email" },
      { id: "department", label: "Department" },
      { id: "position", label: "Position" },
      { id: "salary", label: "Salary" },
      { id: "status", label: "Status" },
      { id: "joinDate", label: "Join Date" },
      { id: "bankName", label: "Bank Name" },
      { id: "accountNumber", label: "Account Number (masked)" },
      { id: "createdAt", label: "Created At" },
      { id: "updatedAt", label: "Updated At" },
    ],
    payrolls: [
      { id: "payrollId", label: "Payroll ID" },
      { id: "period", label: "Period" },
      { id: "date", label: "Date" },
      { id: "employees", label: "Number of Employees" },
      { id: "totalAmount", label: "Total Amount" },
      { id: "status", label: "Status" },
      { id: "createdAt", label: "Created At" },
      { id: "updatedAt", label: "Updated At" },
    ],
    payslips: [
      { id: "payslipId", label: "Payslip ID" },
      { id: "employeeId", label: "Employee ID" },
      { id: "employeeName", label: "Employee Name" },
      { id: "payrollId", label: "Payroll ID" },
      { id: "period", label: "Period" },
      { id: "date", label: "Date" },
      { id: "grossAmount", label: "Gross Amount" },
      { id: "deductions", label: "Deductions" },
      { id: "netAmount", label: "Net Amount" },
      { id: "status", label: "Status" },
      { id: "createdAt", label: "Created At" },
    ],
  }

  const fields = availableFields[type]

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedFields(fields.map((field) => field.id))
    } else {
      setSelectedFields([])
    }
  }

  // Handle individual field selection
  const handleFieldSelection = (fieldId: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, fieldId])
    } else {
      setSelectedFields(selectedFields.filter((id) => id !== fieldId))
    }
  }

  // Reset selections when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormat("csv")
      setSelectedFields([])
      setSelectAll(false)
    }
    onOpenChange(open)
  }

  // Handle export button click
  const handleExport = () => {
    if (selectedFields.length === 0) {
      // If no fields selected, select all fields
      onExport(
        format,
        fields.map((field) => field.id),
      )
    } else {
      onExport(format, selectedFields)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="format">Export Format</TabsTrigger>
            <TabsTrigger value="fields">Select Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="py-4">
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as "csv" | "excel" | "pdf")}>
              <div className="flex items-start space-x-2 space-y-0 mb-4">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">CSV Format</p>
                    <p className="text-sm text-gray-500">Export as comma-separated values file</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-start space-x-2 space-y-0 mb-4">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="font-normal flex items-center">
                  <Table className="h-5 w-5 mr-2 text-green-500" />
                  <div>
                    <p className="font-medium">Excel Format</p>
                    <p className="text-sm text-gray-500">Export as Microsoft Excel spreadsheet</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-start space-x-2 space-y-0">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="font-normal flex items-center">
                  <FileSpreadsheet className="h-5 w-5 mr-2 text-red-500" />
                  <div>
                    <p className="font-medium">PDF Format</p>
                    <p className="text-sm text-gray-500">Export as PDF document</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </TabsContent>

          <TabsContent value="fields" className="py-4">
            <div className="mb-4 flex items-center space-x-2">
              <Checkbox id="selectAll" checked={selectAll} onCheckedChange={handleSelectAll} />
              <Label htmlFor="selectAll" className="font-medium">
                Select All Fields
              </Label>
            </div>

            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={(checked) => handleFieldSelection(field.id, checked as boolean)}
                    />
                    <Label htmlFor={field.id} className="font-normal">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
