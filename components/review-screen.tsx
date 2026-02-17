"use client"

import { MapPin, Clock, Footprints } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/components/dashboard-context"
import type { ActivityResponse } from "@/types/api"

export function ReviewScreen() {
  const { activities } = useDashboard()

  const completedActivities = activities.filter((a) => a.status === "completed")
  const inProgressActivities = activities.filter((a) => a.status === "in_progress")

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="mb-2 text-xl font-black text-foreground">活動履歴</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        チームメンバーの運動記録を確認できます
      </p>

      {inProgressActivities.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-warning">
            進行中 ({inProgressActivities.length})
          </h2>
          <div className="flex flex-col gap-4">
            {inProgressActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold text-foreground">
          完了済み ({completedActivities.length})
        </h2>
        <div className="flex flex-col gap-4">
          {completedActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {activities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Footprints className="mb-4 h-12 w-12 opacity-30" />
          <p className="text-sm">まだ活動記録がありません</p>
        </div>
      )}
    </div>
  )
}

function ActivityCard({ activity }: { activity: ActivityResponse }) {
  const time = new Date(activity.started_at)
  const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`

  const isRunning = activity.exercise_type === "running"
  const statusLabel = activity.status === "completed" ? "完了" : activity.status === "in_progress" ? "進行中" : activity.status
  const statusColor = activity.status === "completed" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {isRunning ? "R" : "G"}
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              {isRunning ? "ランニング" : "ジム"}
            </div>
            <div className="text-[10px] text-muted-foreground">{timeStr}</div>
          </div>
        </div>
        <div className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", statusColor)}>
          {statusLabel}
        </div>
      </div>

      {/* Activity Details */}
      <div className="mb-3 flex gap-4 text-sm">
        {isRunning && activity.distance_km !== undefined ? (
          <>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Footprints className="h-3.5 w-3.5" />
              <span className="font-bold text-foreground">{activity.distance_km.toFixed(1)}km</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-bold text-foreground">{activity.duration_min}分</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-bold text-foreground">{activity.duration_min}分</span>
            </div>
            {activity.gym_location_name && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-foreground">{activity.gym_location_name}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* GPS Map Preview */}
      {isRunning && activity.gps_points && activity.gps_points.length > 0 && (
        <div className="relative h-32 overflow-hidden rounded-lg bg-secondary">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(hsl(0 0% 50% / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50% / 0.2) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 130">
            {(() => {
              const points = activity.gps_points!
              if (points.length < 2) return null
              const lats = points.map((p) => p.latitude)
              const lngs = points.map((p) => p.longitude)
              const minLat = Math.min(...lats)
              const maxLat = Math.max(...lats)
              const minLng = Math.min(...lngs)
              const maxLng = Math.max(...lngs)
              const rangeX = maxLng - minLng || 0.001
              const rangeY = maxLat - minLat || 0.001
              const svgPoints = points.map((p) => ({
                x: 20 + ((p.longitude - minLng) / rangeX) * 260,
                y: 110 - ((p.latitude - minLat) / rangeY) * 90,
              }))
              const pathD = `M ${svgPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`
              return (
                <>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="hsl(0 84% 60%)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {svgPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="hsl(0 84% 60%)" />
                  ))}
                </>
              )
            })()}
          </svg>
          <div className="absolute bottom-2 left-2 rounded-md bg-card/80 px-2 py-0.5 text-[10px] text-foreground backdrop-blur">
            GPS軌跡マップ
          </div>
        </div>
      )}
    </div>
  )
}
