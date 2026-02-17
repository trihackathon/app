"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Square, MapPin, Timer, Footprints, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Mode = "running" | "gym"

export function TrackingScreen() {
  const [mode, setMode] = useState<Mode>("running")
  const [isTracking, setIsTracking] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [distance, setDistance] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
        if (mode === "running") {
          setDistance((prev) => prev + 0.008 + Math.random() * 0.004)
        }
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isTracking, mode])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const pace = elapsed > 0 && distance > 0 ? elapsed / 60 / distance : 0

  const handleStartStop = () => {
    if (isTracking) {
      setIsTracking(false)
    } else {
      setElapsed(0)
      setDistance(0)
      setIsTracking(true)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="mb-6 text-xl font-black text-foreground">運動を記録</h1>

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

      {/* Map Area (Simulated) */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex h-64 items-center justify-center relative">
          {/* Simulated Map Grid */}
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
              {/* Animated GPS dot */}
              <div className="relative mb-4">
                <div className="h-4 w-4 rounded-full bg-primary" />
                <div className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/40" />
              </div>

              {mode === "running" ? (
                <>
                  {/* Simulated route line */}
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

      {/* Goal Progress */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">今日の目標</span>
          <span className="font-bold text-foreground">
            {mode === "running" ? "5.0 km" : "30 分"}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              mode === "running"
                ? distance >= 5 ? "bg-accent" : "bg-primary"
                : elapsed >= 1800 ? "bg-accent" : "bg-primary"
            )}
            style={{
              width: `${Math.min(100, mode === "running" ? (distance / 5) * 100 : (elapsed / 1800) * 100)}%`,
            }}
          />
        </div>
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {mode === "running"
            ? `${Math.min(100, Math.round((distance / 5) * 100))}%`
            : `${Math.min(100, Math.round((elapsed / 1800) * 100))}%`}
        </div>
      </div>

      {/* Start/Stop Button */}
      <Button
        size="lg"
        onClick={handleStartStop}
        className={cn(
          "w-full py-6 text-lg font-black",
          isTracking
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isTracking ? (
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
