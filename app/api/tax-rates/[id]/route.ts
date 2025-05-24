import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { TaxCalculationService } from "@/lib/services/taxCalculationService"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const taxRate = await TaxCalculationService.getTaxRateById(id)

    if (!taxRate) {
      return NextResponse.json({ error: "Tax rate not found" }, { status: 404 })
    }

    return NextResponse.json(taxRate)
  } catch (error: any) {
    console.error(`Error fetching tax rate ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const data = await request.json()

    // Handle date conversions
    if (data.effectiveDate) {
      data.effectiveDate = new Date(data.effectiveDate)
    }

    if (data.expiryDate) {
      data.expiryDate = new Date(data.expiryDate)
    }

    const success = await TaxCalculationService.updateTaxRate(id, data)

    if (!success) {
      return NextResponse.json({ error: "Tax rate not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error updating tax rate ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
