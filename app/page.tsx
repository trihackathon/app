"use client"

import { useState, useEffect } from "react"
import { LandingPage } from "@/components/landing-page"
import { TeamCreation } from "@/components/team-creation"
import { DashboardHome } from "@/components/dashboard-home"
import { TrackingScreen } from "@/components/tracking-screen"
import { ReviewScreen } from "@/components/review-screen"
import { NotificationsScreen } from "@/components/notifications-screen"
import { StatsScreen } from "@/components/stats-screen"
import { FuneralMode } from "@/components/funeral-mode"
import { BottomNav } from "@/components/bottom-nav"
import { AppHeader } from "@/components/app-header"
import { SosModal } from "@/components/sos-modal"
import { mockTeam, mockNotifications } from "@/lib/mock-data"

type AppState = "landing" | "create-team" | "dashboard" | "funeral"
type DashboardPage = "home" | "tracking" | "review" | "notifications" | "stats"

export default function Page() {
  const [appState, setAppState] = useState<AppState>("landing")
  const [activePage, setActivePage] = useState<DashboardPage>("home")
  const [sosOpen, setSosOpen] = useState(false)
  const [countdown, setCountdown] = useState("02:59:00")

  // Countdown timer (simulated)
  useEffect(() => {
    if (appState !== "dashboard") return
    let seconds = 2 * 3600 + 59 * 60

    const interval = setInterval(() => {
      seconds -= 1
      if (seconds <= 0) seconds = 0
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = seconds % 60
      setCountdown(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [appState])

  const unreadCount = mockNotifications.filter((n) => !n.read).length

  if (appState === "landing") {
    return (
      <LandingPage
        onEnter={() => setAppState("create-team")}
      />
    )
  }

  if (appState === "create-team") {
    return (
      <TeamCreation
        onComplete={() => setAppState("dashboard")}
        onBack={() => setAppState("landing")}
      />
    )
  }

  if (appState === "funeral") {
    return (
      <FuneralMode
        onRetry={() => setAppState("create-team")}
        onBackToLanding={() => setAppState("landing")}
      />
    )
  }

  // Dashboard state
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        teamName={mockTeam.name}
        onSos={() => setSosOpen(true)}
        onFuneral={() => setAppState("funeral")}
      />

      <main>
        {activePage === "home" && (
          <DashboardHome team={mockTeam} countdown={countdown} />
        )}
        {activePage === "tracking" && <TrackingScreen />}
        {activePage === "review" && <ReviewScreen />}
        {activePage === "notifications" && <NotificationsScreen />}
        {activePage === "stats" && <StatsScreen />}
      </main>

      <BottomNav
        active={activePage}
        onNavigate={(page) => setActivePage(page as DashboardPage)}
        unreadCount={unreadCount}
      />

      <SosModal
        isOpen={sosOpen}
        onClose={() => setSosOpen(false)}
        memberName="田中 太郎"
        sosRemaining={1}
      />
    </div>
  )
}
