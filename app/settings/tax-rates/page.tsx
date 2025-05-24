"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import type { TaxRate } from "@/lib/models/taxRate"
import { countries } from "@/lib/utils/countries"

export default function TaxRatesPage() {
  const router = useRouter()
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchTaxRates()
  }, [activeTab])

  async function fetchTaxRates() {
    setIsLoading(true)
    try {
      let url = "/api/tax-rates"
      if (activeTab !== "all") {
        url += `?isActive=${activeTab === "active"}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch tax rates")
      }

      const data = await response.json()
      setTaxRates(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function getCountryName(countryCode: string) {
    return countries.find((c) => c.code === countryCode)?.name || countryCode
  }

  function formatDate(date: string | Date) {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tax Rates Management</h1>
        <Button onClick={() => router.push("/settings/tax-rates/add")}>Add New Tax Rate</Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tax Rates</CardTitle>
          <CardDescription>Manage tax rates for different countries and regions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <p>Loading tax rates...</p>
                </div>
              ) : taxRates.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No tax rates found.</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push("/settings/tax-rates/add")}>
                    Add Your First Tax Rate
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Country</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxRates.map((taxRate) => (
                        <TableRow key={taxRate._id?.toString()}>
                          <TableCell>{getCountryName(taxRate.countryCode)}</TableCell>
                          <TableCell>{taxRate.regionCode || "All"}</TableCell>
                          <TableCell>{taxRate.name}</TableCell>
                          <TableCell>{taxRate.currency.toUpperCase()}</TableCell>
                          <TableCell>{formatDate(taxRate.effectiveDate)}</TableCell>
                          <TableCell>
                            <Badge variant={taxRate.isActive ? "default" : "secondary"}>
                              {taxRate.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/settings/tax-rates/${taxRate._id}`)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Calculation Information</CardTitle>
          <CardDescription>How tax calculations work in PayrollMate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            PayrollMate uses location-based tax calculations to determine the appropriate tax rates for each employee
            based on their country and region.
          </p>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium">Tax Calculation Process:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Employee location is determined from their profile</li>
              <li>The system finds the applicable tax rate for their location</li>
              <li>Income tax is calculated using progressive tax brackets</li>
              <li>Social security and other mandatory deductions are applied</li>
              <li>Any additional withholding or special tax status is considered</li>
              <li>The final net pay is calculated after all deductions</li>
            </ol>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium">Tax Rate Priority:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Region-specific tax rates (e.g., California in the US)</li>
              <li>Country-level tax rates if no region-specific rate exists</li>
              <li>Default tax rate if no country-specific rate exists</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
