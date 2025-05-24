import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { TaxCalculationService } from "@/lib/services/taxCalculationService"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const countryCode = searchParams.get("countryCode") || undefined
    const isActive = searchParams.has("isActive") ? searchParams.get("isActive") === "true" : undefined

    const taxRates = await TaxCalculationService.getAllTaxRates({
      countryCode: countryCode as string | undefined,
      isActive,
    })

    return NextResponse.json(taxRates)
  } catch (error: any) {
    console.error("Error fetching tax rates:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.countryCode || !data.name || !data.incomeTaxRates || !data.currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Set default values
    const taxRateData = {
      ...data,
      isActive: data.isActive ?? true,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    }

    const taxRate = await TaxCalculationService.createTaxRate(taxRateData)

    return NextResponse.json(taxRate, { status: 201 })
  } catch (error: any) {
    console.error("Error creating tax rate:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
