import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ValidationResult } from "@/lib/utils/csv-parser"

interface ValidationErrorsProps {
  validation: ValidationResult
}

export function ValidationErrors({ validation }: ValidationErrorsProps) {
  if (validation.valid) return null

  const errorCount = Object.keys(validation.errors).length

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Validation Errors</AlertTitle>
      <AlertDescription>
        Found {errorCount} {errorCount === 1 ? "row" : "rows"} with errors:
        <ScrollArea className="h-[200px] mt-2">
          <ul className="list-disc pl-5 space-y-1">
            {Object.entries(validation.errors).map(([rowIndex, errors]) => (
              <li key={rowIndex}>
                Row {Number.parseInt(rowIndex) + 1}:
                <ul className="list-disc pl-5">
                  {errors.map((error, i) => (
                    <li key={i} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </AlertDescription>
    </Alert>
  )
}
