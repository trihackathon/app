"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { mockNotifications } from "@/lib/mock-data"

interface DashboardContextType {
  countdown: string
  sosOpen: boolean
  setSosOpen: (open: boolean) => void
  unreadCount: number
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [countdown, setCountdown] = useState("02:59:00")
  const [sosOpen, setSosOpen] = useState(false)

  const unreadCount = mockNotifications.filter((n) => !n.read).length

  useEffect(() => {
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
  }, [])

  return (
    <DashboardContext.Provider value={{ countdown, sosOpen, setSosOpen, unreadCount }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
