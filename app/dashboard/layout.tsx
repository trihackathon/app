"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { SosModal } from "@/components/sos-modal"
import { DashboardProvider, useDashboard } from "@/components/dashboard-context"
import { AuthGuard } from "@/components/auth-guard"
import { Spinner } from "@/components/ui/spinner"

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { sosOpen, setSosOpen, unreadCount, team, user, isLoading } = useDashboard()

  // チームが forming 状態で3人未満の場合は、チーム作成画面に戻す
  useEffect(() => {
    if (!isLoading && team && team.status === "forming" && team.members.length < 3) {
      router.push("/create-team")
    }
  }, [isLoading, team, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  // forming状態で3人未満の場合は何も表示しない（リダイレクト中）
  if (team && team.status === "forming" && team.members.length < 3) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        teamName={team?.name ?? "チーム未設定"}
        onSos={() => setSosOpen(true)}
        userAvatarUrl={user?.avatar_url}
        userName={user?.name}
      />

      <main>{children}</main>

      <BottomNav unreadCount={unreadCount} />

      <SosModal
        isOpen={sosOpen}
        onClose={() => setSosOpen(false)}
        memberName={user?.name ?? ""}
        sosRemaining={1}
        teamMembers={team?.members ?? []}
        currentUserId={user?.id ?? ""}
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
