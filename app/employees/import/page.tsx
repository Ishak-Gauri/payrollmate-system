"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Upload, Download, FileText, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CsvPreviewTable } from "@/components/employees/csv-preview-table"
import { ValidationErrors } from "@/components/employees/validation-errors"
import { ImportResults } from "@/components/employees/import-results"
import { parseEmployeeCsv, generateCsvTemplate } from "@/lib/utils/csv-parser"
import type { CreateEmployeeData } from "@/lib/models/employee"
import type { ValidationResult } from "@/lib/utils/csv-parser"

enum ImportStage {
  UPLOAD = 0,
  PREVIEW = 1,
  IMPORTING = 2,
  RESULTS = 3,
}

export default function BulkImportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<ImportStage>(ImportStage.UPLOAD)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationResult>({ valid: true, errors: {}, data: [] })
  const [employeesToImport, setEmployeesToImport] = useState<CreateEmployeeData[]>([])
  const [importResults, setImportResults] = useState<any>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) return

    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      return
    }

    setFile(selectedFile)

    try {
      const result = await parseEmployeeCsv(selectedFile)

      if (!result.success) {
        setError(result.message || "Failed to parse CSV file")
        return
      }

      setValidation(result.validation!)
      setEmployeesToImport(result.transformedData!)
      setStage(ImportStage.PREVIEW)
    } catch (error: any) {
      setError(`Error processing file: ${error.message}`)
    }
  }

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvTemplate()
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "employee_import_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (!validation.valid) {
      toast({
        title: "Validation errors",
        description: "Please fix the errors before importing",
        variant: "destructive",
      })
      return
    }

    setStage(ImportStage.IMPORTING)

    try {
      const response = await fetch("/api/employees/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employees: employeesToImport }),
      })

      const results = await response.json()

      if (!response.ok) {
        throw new Error(results.error || "Failed to import employees")
      }

      setImportResults(results)
      setStage(ImportStage.RESULTS)

      toast({
        title: "Import completed",
        description: `Successfully imported ${results.successful} of ${results.total} employees`,
      })
    } catch (error: any) {
      setError(`Import failed: ${error.message}`)
      setStage(ImportStage.PREVIEW)
    }
  }

  const resetImport = () => {
    setFile(null)
    setError(null)
    setValidation({ valid: true, errors: {}, data: [] })
    setEmployeesToImport([])
    setImportResults(null)
    setStage(ImportStage.UPLOAD)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Bulk Import Employees</CardTitle>
          <CardDescription>Import multiple employees at once using a CSV file</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {stage === ImportStage.UPLOAD && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a CSV file with employee data. Make sure it follows the required format.
                  </p>
                </div>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" /> Download Template
                </Button>
              </div>

              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Drag and drop your CSV file here</h3>
                <p className="text-sm text-muted-foreground mb-4">or click the button below to browse files</p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Select CSV File
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Requirements</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>File must be in CSV format</li>
                  <li>First row must contain column headers</li>
                  <li>Required columns: name, email, department, position, salary, bankName, accountNumber</li>
                  <li>Optional columns: routingNumber</li>
                </ul>
              </div>
            </div>
          )}

          {stage === ImportStage.PREVIEW && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium mb-2">Preview Import Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Review the data before importing. Fix any validation errors if needed.
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  File: <span className="font-medium">{file?.name}</span>
                </div>
              </div>

              {!validation.valid && <ValidationErrors validation={validation} />}

              <CsvPreviewTable data={validation.data} validation={validation} />

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Import Summary</h4>
                <ul className="space-y-1 text-sm">
                  <li>Total rows: {validation.data.length}</li>
                  <li>Valid rows: {validation.data.length - Object.keys(validation.errors).length}</li>
                  <li>Rows with errors: {Object.keys(validation.errors).length}</li>
                </ul>
              </div>
            </div>
          )}

          {stage === ImportStage.IMPORTING && (
            <div className="py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Importing Employees</h3>
              <p className="text-sm text-muted-foreground">Please wait while we process your data...</p>
            </div>
          )}

          {stage === ImportStage.RESULTS && importResults && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium mb-2">Import Completed</h3>
              </div>

              <ImportResults results={importResults} />

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Import Summary</h4>
                <ul className="space-y-1 text-sm">
                  <li>Total employees: {importResults.total}</li>
                  <li>Successfully imported: {importResults.successful}</li>
                  <li>Failed to import: {importResults.failed}</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {stage === ImportStage.UPLOAD && (
            <div className="w-full">
              <Button variant="outline" className="w-full" onClick={() => router.push("/employees")}>
                Cancel
              </Button>
            </div>
          )}

          {stage === ImportStage.PREVIEW && (
            <>
              <Button variant="outline" onClick={resetImport}>
                Upload Different File
              </Button>
              <Button
                onClick={handleImport}
                disabled={!validation.valid}
                className={!validation.valid ? "opacity-50 cursor-not-allowed" : ""}
              >
                Import {validation.data.length - Object.keys(validation.errors).length} Employees
              </Button>
            </>
          )}

          {stage === ImportStage.RESULTS && (
            <>
              <Button variant="outline" onClick={resetImport}>
                Import Another File
              </Button>
              <Button onClick={() => router.push("/employees")}>Go to Employees</Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
