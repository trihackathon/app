"use client"

import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { SosModal } from "@/components/sos-modal"
import { DashboardProvider, useDashboard } from "@/components/dashboard-context"
import { AuthGuard } from "@/components/auth-guard"

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { sosOpen, setSosOpen, unreadCount, team, user, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        teamName={team?.name ?? "チーム未設定"}
        onSos={() => setSosOpen(true)}
      />

      <main>{children}</main>

      <BottomNav unreadCount={unreadCount} />

      <SosModal
        isOpen={sosOpen}
        onClose={() => setSosOpen(false)}
        memberName={user?.name ?? ""}
        sosRemaining={1}
      />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </DashboardProvider>
    </AuthGuard>
  )
}
