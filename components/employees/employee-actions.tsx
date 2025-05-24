import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Upload } from "lucide-react"

export function EmployeeActions() {
  return (
    <div className="flex space-x-2">
      <Button asChild>
        <Link href="/employees/add">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/employees/import">
          <Upload className="mr-2 h-4 w-4" /> Bulk Import
        </Link>
      </Button>
    </div>
  )
}
