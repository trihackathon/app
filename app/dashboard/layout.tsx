"use client"

import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { SosModal } from "@/components/sos-modal"
import { DashboardProvider, useDashboard } from "@/components/dashboard-context"
import { mockTeam } from "@/lib/mock-data"

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { sosOpen, setSosOpen, unreadCount } = useDashboard()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        teamName={mockTeam.name}
        onSos={() => setSosOpen(true)}
      />

      <main>{children}</main>

      <BottomNav unreadCount={unreadCount} />

      <SosModal
        isOpen={sosOpen}
        onClose={() => setSosOpen(false)}
        memberName="田中 太郎"
        sosRemaining={1}
      />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardProvider>
  )
}
