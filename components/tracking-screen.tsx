"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Square, MapPin, Timer, Footprints, Dumbbell, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/components/dashboard-context"
import {
  startRunning,
  finishRunning,
  sendGPSPoints,
  getGymLocations,
  gymCheckin,
  gymCheckout,
  getMyActivities,
} from "@/lib/api/endpoints"
import type { GymLocationResponse, ActivityResponse } from "@/types/api"

type Mode = "running" | "gym"

export function TrackingScreen() {
  const { user, team, currentEvaluation, refreshActivities, refreshStatus, refreshEvaluation } = useDashboard()

  // 今週の累積データ（自分の進捗）
  const myWeeklyProgress = currentEvaluation?.members?.find((m) => m.user_id === user?.id)
  const weeklyDistanceKm = myWeeklyProgress?.total_distance_km ?? 0
  const weeklyVisits = myWeeklyProgress?.total_visits ?? 0
  const [mode, setMode] = useState<Mode>("running")
  const [isTracking, setIsTracking] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [distance, setDistance] = useState(0)
  const [activityId, setActivityId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [gymLocations, setGymLocations] = useState<GymLocationResponse[]>([])
  const [selectedGym, setSelectedGym] = useState<string | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const gpsBufferRef = useRef<{ latitude: number; longitude: number; accuracy: number; timestamp: string }[]>([])
  const lastSendRef = useRef<number>(0)
  const startTimeRef = useRef<Date | null>(null)

  // Get goal targets from team
  const goalDistanceKm = team?.goal?.target_distance_km ?? 5
  const goalVisitsPerWeek = team?.goal?.target_visits_per_week ?? 3

  // 表示用の累積値（ランニング中は今週の累積 + 今回の距離）
  const displayDistanceKm = mode === "running" ? weeklyDistanceKm + distance : weeklyDistanceKm
  const safeGoalKm = goalDistanceKm > 0 ? goalDistanceKm : 1
  const safeGoalVisits = goalVisitsPerWeek > 0 ? goalVisitsPerWeek : 1

  // 進行中のアクティビティを復元する
  useEffect(() => {
    const restoreInProgressActivity = async () => {
      setIsRestoring(true)
      try {
        const result = await getMyActivities()
        if (!result.ok) {
          setIsRestoring(false)
          return
        }

        // 進行中のアクティビティを探す
        const inProgressActivity = result.data.find((activity: ActivityResponse) => 
          activity.status === "in_progress"
        )

        if (inProgressActivity) {
          // アクティビティが見つかったら復元
          const activityMode = inProgressActivity.exercise_type === "gym" ? "gym" : "running"
          setMode(activityMode)
          setActivityId(inProgressActivity.id)
          setIsTracking(true)
          
          // 経過時間を計算
          const startTime = new Date(inProgressActivity.started_at)
          startTimeRef.current = startTime
          const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000)
          setElapsed(elapsedSeconds)

          // ランニングの場合は距離を復元し、GPS監視を再開
          if (activityMode === "running") {
            setDistance(inProgressActivity.distance_km || 0)
            
            // GPS監視を再開
            watchIdRef.current = navigator.geolocation.watchPosition(
              (position) => {
                gpsBufferRef.current.push({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: new Date().toISOString(),
                })
                sendBufferedPoints(inProgressActivity.id)
              },
              (err) => {
                console.error("GPS tracking error:", err)
              },
              { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
            )
          }
        }
      } catch (err) {
        console.error("Failed to restore activity:", err)
      } finally {
        setIsRestoring(false)
      }
    }

    restoreInProgressActivity()

    // クリーンアップ
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, []) // 最初のマウント時のみ実行

  // Load gym locations
  useEffect(() => {
    if (mode === "gym") {
      getGymLocations().then((result) => {
        if (result.ok) setGymLocations(result.data)
      })
    }
  }, [mode])

  // Timer
  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          // 開始時刻から正確に経過時間を計算
          const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
          setElapsed(elapsedSeconds)
        } else {
          // フォールバック：以前の方法
          setElapsed((prev) => prev + 1)
        }
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isTracking])

  const sendBufferedPoints = useCallback(async (aid: string) => {
    const now = Date.now()
    if (now - lastSendRef.current < 5000) return
    if (gpsBufferRef.current.length === 0) return

    const points = gpsBufferRef.current.map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
      accuracy: p.accuracy,
      timestamp: p.timestamp,
    }))
    gpsBufferRef.current = []
    lastSendRef.current = now

    const result = await sendGPSPoints(aid, { points })
    if (result.ok) {
      setDistance(result.data.current_distance_km)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const pace = elapsed > 0 && distance > 0 ? elapsed / 60 / distance : 0

  const handleStartRunning = async () => {
    if (isStarting) return
    setIsStarting(true)
    setError(null)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      )

      const result = await startRunning({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })

      if (!result.ok) {
        setError("ランニング開始に失敗しました")
        return
      }

      const aid = result.data.id
      setActivityId(aid)
      setElapsed(0)
      setDistance(0)
      setIsTracking(true)
      startTimeRef.current = new Date(result.data.started_at || new Date())

      // Start GPS watching
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          gpsBufferRef.current.push({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          })
          sendBufferedPoints(aid)
        },
        undefined,
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      )
    } catch {
      setError("位置情報の取得に失敗しました。GPS設定を確認してください。")
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopRunning = async () => {
    if (!activityId) return
    setError(null)

    // Stop GPS watching
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    // Send remaining buffered points
    if (gpsBufferRef.current.length > 0) {
      await sendBufferedPoints(activityId)
    }

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      )

      const result = await finishRunning(activityId, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })

      if (!result.ok) {
        setError("ランニング終了の記録に失敗しました")
      }
    } catch {
      setError("位置情報の取得に失敗しました")
    }

    setIsTracking(false)
    setActivityId(null)
    startTimeRef.current = null
    refreshActivities()
    refreshStatus()
    refreshEvaluation()
  }

  const handleStartGym = async () => {
    if (isStarting) return
    setIsStarting(true)
    setError(null)

    if (!selectedGym && gymLocations.length > 0) {
      setSelectedGym(gymLocations[0].id)
    }

    const gymId = selectedGym || gymLocations[0]?.id
    if (!gymId) {
      setError("ジムの場所が登録されていません")
      return
    }

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      )

      const result = await gymCheckin({
        gym_location_id: gymId,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })

      if (!result.ok) {
        setError("チェックインに失敗しました")
        return
      }

      setActivityId(result.data.id)
      setElapsed(0)
      setIsTracking(true)
      startTimeRef.current = new Date(result.data.started_at || new Date())
    } catch {
      setError("位置情報の取得に失敗しました")
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopGym = async () => {
    if (!activityId) return
    setError(null)

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      )

      const result = await gymCheckout(activityId, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })

      if (!result.ok) {
        setError("チェックアウトに失敗しました")
      }
    } catch {
      setError("位置情報の取得に失敗しました")
    }

    setIsTracking(false)
    setActivityId(null)
    startTimeRef.current = null
    refreshActivities()
    refreshStatus()
    refreshEvaluation()
  }

  const handleStartStop = () => {
    if (isTracking) {
      if (mode === "running") handleStopRunning()
      else handleStopGym()
    } else {
      if (mode === "running") handleStartRunning()
      else handleStartGym()
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="mb-6 text-xl font-black text-foreground">運動を記録</h1>

      {isRestoring && (
        <div className="mb-4 rounded-lg bg-primary/10 p-3 text-sm text-primary flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          進行中のアクティビティを確認しています...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Mode Toggle */}
      <div className="mb-6 flex gap-2 rounded-xl bg-card p-1.5 border border-border">
        <button
          onClick={() => { if (!isTracking) setMode("running") }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors",
            mode === "running"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Footprints className="h-4 w-4" />
          ランニング
        </button>
        <button
          onClick={() => { if (!isTracking) setMode("gym") }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors",
            mode === "gym"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Dumbbell className="h-4 w-4" />
          ジム
        </button>
      </div>

      {/* Gym Location Selector */}
      {mode === "gym" && !isTracking && gymLocations.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <label className="mb-2 block text-xs font-bold text-foreground">ジムを選択</label>
          <select
            value={selectedGym || ""}
            onChange={(e) => setSelectedGym(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary p-2 text-sm text-foreground"
          >
            {gymLocations.map((gym) => (
              <option key={gym.id} value={gym.id}>{gym.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Map Area */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex h-64 items-center justify-center relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(hsl(0 0% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50% / 0.3) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          {isTracking ? (
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="h-4 w-4 rounded-full bg-primary" />
                <div className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/40" />
              </div>

              {mode === "running" ? (
                <>
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 250">
                    <path
                      d="M 50 200 Q 100 150 130 130 T 180 100 T 220 70 T 260 50"
                      fill="none"
                      stroke="hsl(0 84% 60%)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="8 4"
                      opacity="0.7"
                    />
                  </svg>
                  <span className="text-sm font-bold text-foreground">GPS追跡中...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-bold text-foreground">ジムエリア内</span>
                  <span className="text-xs text-muted-foreground">滞在時間を計測中</span>
                </>
              )}
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center gap-2 text-muted-foreground">
              <MapPin className="h-8 w-8" />
              <span className="text-sm">
                {mode === "running" ? "開始するとGPS追跡が始まります" : "ジム到着で自動計測開始"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Timer className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
          <div className="font-mono text-lg font-black text-foreground">
            {formatTime(elapsed)}
          </div>
          <div className="text-[10px] text-muted-foreground">経過時間</div>
        </div>

        {mode === "running" ? (
          <>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <Footprints className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <div className="font-mono text-lg font-black text-foreground">
                {distance.toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground">距離 (km)</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <span className="mx-auto mb-1 block text-sm text-muted-foreground">{'min/km'}</span>
              <div className="font-mono text-lg font-black text-foreground">
                {pace > 0 ? pace.toFixed(1) : "--"}
              </div>
              <div className="text-[10px] text-muted-foreground">ペース</div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <Dumbbell className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <div className="font-mono text-lg font-black text-foreground">
                {Math.floor(elapsed / 60)}
              </div>
              <div className="text-[10px] text-muted-foreground">滞在 (分)</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <MapPin className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <div className="font-mono text-lg font-black text-accent">
                {isTracking ? "範囲内" : "--"}
              </div>
              <div className="text-[10px] text-muted-foreground">ジオフェンス</div>
            </div>
          </>
        )}
      </div>

      {/* Goal Progress - 今週の累積を表示 */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">今週の目標</span>
          <span className="font-bold text-foreground">
            {mode === "running"
              ? `${displayDistanceKm.toFixed(1)} / ${goalDistanceKm} km`
              : `${weeklyVisits} / ${goalVisitsPerWeek} 回`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              mode === "running"
                ? displayDistanceKm >= goalDistanceKm ? "bg-accent" : "bg-primary"
                : weeklyVisits >= goalVisitsPerWeek ? "bg-accent" : "bg-primary"
            )}
            style={{
              width: `${Math.min(100, mode === "running" ? (displayDistanceKm / safeGoalKm) * 100 : (weeklyVisits / safeGoalVisits) * 100)}%`,
            }}
          />
        </div>
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {mode === "running"
            ? `${Math.min(100, Math.round((displayDistanceKm / safeGoalKm) * 100))}%`
            : `${Math.min(100, Math.round((weeklyVisits / safeGoalVisits) * 100))}%`}
        </div>
      </div>

      {/* Start/Stop Button */}
      <Button
        size="lg"
        onClick={handleStartStop}
        disabled={isStarting || isRestoring}
        className={cn(
          "w-full py-6 text-lg font-black",
          isTracking
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isStarting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            開始中...
          </>
        ) : isTracking ? (
          <>
            <Square className="mr-2 h-5 w-5" />
            {mode === "running" ? "ランニング終了" : "退出する"}
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            {mode === "running" ? "ランニング開始" : "ジム到着"}
          </>
        )}
      </Button>

      {isTracking && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {mode === "running"
            ? "GPS軌跡を記録中 -- 仲間がレビューします"
            : "ジオフェンスで滞在時間を自動計測中"}
        </p>
      )}
    </div>
  )
}
