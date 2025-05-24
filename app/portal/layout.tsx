import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { EmployeePortalNavbar } from "@/components/portal/employee-portal-navbar"

export const metadata: Metadata = {
  title: "Employee Portal | PayrollMate",
  description: "Access your payslips and personal information",
}

export default async function EmployeePortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  // If not logged in, redirect to login
  if (!session) {
    redirect("/auth/login?callbackUrl=/portal")
  }

  // If user is an admin, redirect to admin dashboard
  if (session.user.role === "admin") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      <EmployeePortalNavbar />
      <main>{children}</main>
    </div>
  )
}
