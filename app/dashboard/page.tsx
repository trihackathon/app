"use client"

import { DashboardHome } from "@/components/dashboard-home"
import { useDashboard } from "@/components/dashboard-context"

export default function DashboardPage() {
  const { team, teamStatus, countdown } = useDashboard()

  return <DashboardHome team={team} teamStatus={teamStatus} countdown={countdown} />
}
