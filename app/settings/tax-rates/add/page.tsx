"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { countries } from "@/lib/utils/countries"
import { PlusCircle, Trash2 } from "lucide-react"

// Form schema with validation
const formSchema = z.object({
  countryCode: z.string().min(2, { message: "Country is required." }),
  regionCode: z.string().optional(),
  name: z.string().min(2, { message: "Name is required." }),
  description: z.string().optional(),
  incomeTaxRates: z
    .array(
      z.object({
        minIncome: z.coerce.number().min(0, { message: "Minimum income must be a positive number." }),
        maxIncome: z.coerce.number().optional(),
        rate: z.coerce.number().min(0, { message: "Rate must be a positive number." }),
        fixedAmount: z.coerce.number().optional(),
      }),
    )
    .min(1, { message: "At least one tax bracket is required." }),
  socialSecurityRate: z.coerce.number().min(0, { message: "Rate must be a positive number." }),
  employerContributionRate: z.coerce.number().min(0, { message: "Rate must be a positive number." }),
  otherDeductions: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Name is required." }),
        type: z.enum(["percentage", "fixed"]),
        value: z.coerce.number().min(0, { message: "Value must be a positive number." }),
        maxAmount: z.coerce.number().optional(),
        isRequired: z.boolean().default(false),
      }),
    )
    .optional()
    .default([]),
  currency: z.string().min(3, { message: "Currency is required." }),
  effectiveDate: z.date(),
  expiryDate: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

// Currency options
const currencies = [
  { code: "usd", name: "US Dollar (USD)" },
  { code: "eur", name: "Euro (EUR)" },
  { code: "gbp", name: "British Pound (GBP)" },
  { code: "cad", name: "Canadian Dollar (CAD)" },
  { code: "aud", name: "Australian Dollar (AUD)" },
  { code: "inr", name: "Indian Rupee (INR)" },
  { code: "jpy", name: "Japanese Yen (JPY)" },
  { code: "cny", name: "Chinese Yuan (CNY)" },
].sort((a, b) => a.name.localeCompare(b.name))

export default function AddTaxRatePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryCode: "",
      regionCode: "",
      name: "",
      description: "",
      incomeTaxRates: [{ minIncome: 0, maxIncome: 0, rate: 0 }],
      socialSecurityRate: 0,
      employerContributionRate: 0,
      otherDeductions: [],
      currency: "usd",
      effectiveDate: new Date(),
      expiryDate: null,
      isActive: true,
    },
  })

  // Set up field arrays for tax brackets and deductions
  const {
    fields: taxBracketFields,
    append: appendTaxBracket,
    remove: removeTaxBracket,
  } = useFieldArray({
    control: form.control,
    name: "incomeTaxRates",
  })

  const {
    fields: deductionFields,
    append: appendDeduction,
    remove: removeDeduction,
  } = useFieldArray({
    control: form.control,
    name: "otherDeductions",
  })

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/tax-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create tax rate")
      }

      toast({
        title: "Success",
        description: "Tax rate has been created successfully.",
      })

      router.push("/settings/tax-rates")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add New Tax Rate</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="tax-brackets">Tax Brackets</TabsTrigger>
              <TabsTrigger value="deductions">Deductions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic details for this tax rate.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="regionCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region/State (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. CA for California" {...field} />
                          </FormControl>
                          <FormDescription>Leave blank for country-wide tax rates</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. US Federal Income Tax 2023" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of this tax rate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tax Brackets Tab */}
            <TabsContent value="tax-brackets">
              <Card>
                <CardHeader>
                  <CardTitle>Income Tax Brackets</CardTitle>
                  <CardDescription>Define the progressive income tax brackets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {taxBracketFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4 pb-4 border-b">
                      <FormField
                        control={form.control}
                        name={`incomeTaxRates.${index}.minIncome`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Min Income</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`incomeTaxRates.${index}.maxIncome`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Max Income</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Leave empty for no upper limit"
                                {...field}
                                value={field.value === undefined ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? undefined : Number(e.target.value)
                                  field.onChange(value)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`incomeTaxRates.${index}.rate`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (taxBracketFields.length > 1) {
                            removeTaxBracket(index)
                          } else {
                            toast({
                              title: "Error",
                              description: "At least one tax bracket is required.",
                              variant: "destructive",
                            })
                          }
                        }}
                        className="mb-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendTaxBracket({ minIncome: 0, maxIncome: 0, rate: 0 })}
                    className="mt-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Tax Bracket
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deductions Tab */}
            <TabsContent value="deductions">
              <Card>
                <CardHeader>
                  <CardTitle>Standard Deductions</CardTitle>
                  <CardDescription>
                    Define standard deductions like social security and employer contributions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="socialSecurityRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Social Security Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormDescription>Percentage deducted from employee's salary</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employerContributionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer Contribution Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormDescription>Percentage paid by employer (not deducted from salary)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Other Deductions</h3>

                  {deductionFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4 pb-4 border-b">
                      <FormField
                        control={form.control}
                        name={`otherDeductions.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Deduction Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Health Insurance" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`otherDeductions.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`otherDeductions.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`otherDeductions.${index}.isRequired`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-sm">Required</FormLabel>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDeduction(index)}
                        className="mb-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendDeduction({
                        name: "",
                        type: "percentage",
                        value: 0,
                        isRequired: false,
                      })
                    }
                    className="mt-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Other Deduction
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Rate Settings</CardTitle>
                  <CardDescription>Configure effective dates and status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="effectiveDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Effective Date</FormLabel>
                          <DatePicker date={field.value} setDate={field.onChange} />
                          <FormDescription>When this tax rate becomes effective</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expiry Date (Optional)</FormLabel>
                          <DatePicker date={field.value} setDate={field.onChange} />
                          <FormDescription>When this tax rate expires (leave blank if no expiry)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>This tax rate will be used for calculations if active</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Tax Rate"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
