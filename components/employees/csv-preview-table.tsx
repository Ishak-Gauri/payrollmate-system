import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { EmployeeCsvData, ValidationResult } from "@/lib/utils/csv-parser"

interface CsvPreviewTableProps {
  data: EmployeeCsvData[]
  validation: ValidationResult
}

export function CsvPreviewTable({ data, validation }: CsvPreviewTableProps) {
  if (!data.length) return null

  return (
    <div className="border rounded-md">
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Row</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Bank Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              const hasError = validation.errors[index]?.length > 0

              return (
                <TableRow key={index} className={hasError ? "bg-red-50" : ""}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>{row.salary}</TableCell>
                  <TableCell>{row.bankName}</TableCell>
                  <TableCell>{row.accountNumber.replace(/\d(?=\d{4})/g, "*")}</TableCell>
                  <TableCell className="text-right">
                    {hasError ? (
                      <Badge variant="destructive">Error</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50">
                        Valid
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
