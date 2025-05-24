import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ImportResultsProps {
  results: {
    total: number
    successful: number
    failed: number
    errors: { email: string; error: string }[]
  }
}

export function ImportResults({ results }: ImportResultsProps) {
  const allSuccessful = results.successful === results.total

  return (
    <Alert variant={allSuccessful ? "default" : "destructive"} className="mb-4">
      {allSuccessful ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertTitle>Import Results</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Successfully imported {results.successful} of {results.total} employees.
          {results.failed > 0 && ` Failed to import ${results.failed} employees.`}
        </p>

        {results.errors.length > 0 && (
          <ScrollArea className="h-[200px] mt-2">
            <ul className="list-disc pl-5 space-y-1">
              {results.errors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error.email}: {error.error}
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </AlertDescription>
    </Alert>
  )
}
