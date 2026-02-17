"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getMe, getMyTeam, getTeamStatus, getTeamActivities, getCurrentEvaluation, getMyPrediction } from "@/lib/api/endpoints"
import type {
  UserResponse,
  TeamResponse,
  TeamStatusResponse,
  ActivityResponse,
  CurrentWeekEvaluationResponse,
  PredictionResponse,
} from "@/types/api"

interface DashboardContextType {
  user: UserResponse | null
  team: TeamResponse | null
  teamStatus: TeamStatusResponse | null
  activities: ActivityResponse[]
  currentEvaluation: CurrentWeekEvaluationResponse | null
  prediction: PredictionResponse | null
  countdown: string
  sosOpen: boolean
  setSosOpen: (open: boolean) => void
  unreadCount: number
  isLoading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  refreshTeam: () => Promise<void>
  refreshActivities: () => Promise<void>
  refreshStatus: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [team, setTeam] = useState<TeamResponse | null>(null)
  const [teamStatus, setTeamStatus] = useState<TeamStatusResponse | null>(null)
  const [activities, setActivities] = useState<ActivityResponse[]>([])
  const [currentEvaluation, setCurrentEvaluation] = useState<CurrentWeekEvaluationResponse | null>(null)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [countdown, setCountdown] = useState("--:--:--")
  const [sosOpen, setSosOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = 0

  // Countdown based on currentEvaluation.week_end
  useEffect(() => {
    if (!currentEvaluation?.week_end) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const end = new Date(currentEvaluation.week_end).getTime()
      const diff = Math.max(0, Math.floor((end - now) / 1000))
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setCountdown(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      )
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [currentEvaluation?.week_end])

  const refreshUser = useCallback(async () => {
    const result = await getMe()
    if (result.ok) {
      setUser(result.data)
    }
  }, [])

  const refreshTeam = useCallback(async () => {
    const result = await getMyTeam()
    if (result.ok) {
      setTeam(result.data)
    }
  }, [])

  const refreshActivities = useCallback(async () => {
    if (!team?.id) return
    const result = await getTeamActivities(team.id)
    if (result.ok) {
      setActivities(result.data)
    }
  }, [team?.id])

  const refreshStatus = useCallback(async () => {
    if (!team?.id) return
    const result = await getTeamStatus(team.id)
    if (result.ok) {
      setTeamStatus(result.data)
    }
  }, [team?.id])

  // Initial data load
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      let redirecting = false
      setIsLoading(true)
      setError(null)

      try {
        // 1. Get user
        const userResult = await getMe()
        if (cancelled) return
        if (!userResult.ok) {
          setError("ユーザー情報の取得に失敗しました")
          setIsLoading(false)
          return
        }
        setUser(userResult.data)

        // 2. Get team
        const teamResult = await getMyTeam()
        if (cancelled) return
        if (!teamResult.ok) {
          // Team not found → redirect to create-team
          redirecting = true
          router.push("/create-team")
          return
        }
        setTeam(teamResult.data)
        const teamId = teamResult.data.id

        // 3. Parallel fetches
        const [statusResult, activitiesResult, evalResult, predictionResult] = await Promise.all([
          getTeamStatus(teamId),
          getTeamActivities(teamId),
          getCurrentEvaluation(teamId),
          getMyPrediction(),
        ])

        if (cancelled) return

        if (statusResult.ok) setTeamStatus(statusResult.data)
        if (activitiesResult.ok) setActivities(activitiesResult.data)
        if (evalResult.ok) setCurrentEvaluation(evalResult.data)
        if (predictionResult.ok) setPrediction(predictionResult.data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "データの取得に失敗しました")
        }
      } finally {
        if (!cancelled && !redirecting) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <DashboardContext.Provider
      value={{
        user,
        team,
        teamStatus,
        activities,
        currentEvaluation,
        prediction,
        countdown,
        sosOpen,
        setSosOpen,
        unreadCount,
        isLoading,
        error,
        refreshUser,
        refreshTeam,
        refreshActivities,
        refreshStatus,
      }}
    >
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
