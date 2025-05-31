"use client"

import type React from "react"
import DashboardLayout from "@/components/admin/dashboard-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
