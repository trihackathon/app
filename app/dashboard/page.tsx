"use client"

import { DashboardHome } from "@/components/dashboard-home"
import { useDashboard } from "@/components/dashboard-context"
import { mockTeam } from "@/lib/mock-data"

export default function DashboardPage() {
  const { countdown } = useDashboard()

  return <DashboardHome team={mockTeam} countdown={countdown} />
}
