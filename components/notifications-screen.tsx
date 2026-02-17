"use client"

import { Bell, AlertTriangle, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/components/dashboard-context"

type GeneratedNotification = {
  id: string
  type: "alert" | "celebration"
  message: string
  timestamp: string
}

export function NotificationsScreen() {
  const { currentEvaluation, activities } = useDashboard()

  // Generate notifications from real data
  const notifications: GeneratedNotification[] = []

  // From currentEvaluation: warnings for members not on track
  if (currentEvaluation?.members) {
    for (const member of currentEvaluation.members) {
      if (!member.on_track) {
        notifications.push({
          id: `warn-${member.user_id}`,
          type: "alert",
          message: `${member.user_name}さんの進捗が目標に届いていません（${member.target_progress_percent}%）`,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  // From activities: recent completions
  for (const activity of activities.slice(0, 5)) {
    if (activity.status === "completed") {
      const isRunning = activity.exercise_type === "running"
      const detail = isRunning && activity.distance_km
        ? `${activity.distance_km.toFixed(1)}km`
        : `${activity.duration_min}分`
      notifications.push({
        id: `act-${activity.id}`,
        type: "celebration",
        message: `${isRunning ? "ランニング" : "ジム"}が完了しました（${detail}）`,
        timestamp: activity.ended_at || activity.started_at,
      })
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-black text-foreground">通知</h1>
      </div>

      {notifications.length > 0 ? (
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell className="mb-4 h-12 w-12 opacity-30" />
          <p className="text-sm">通知はありません</p>
        </div>
      )}
    </div>
  )
}

function NotificationCard({ notification }: { notification: GeneratedNotification }) {
  const iconMap = {
    alert: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    celebration: { icon: PartyPopper, color: "text-accent", bg: "bg-accent/10" },
  }

  const config = iconMap[notification.type]
  const Icon = config.icon
  const time = new Date(notification.timestamp)
  const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`

  return (
    <div className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left">
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.bg)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-foreground font-medium">
          {notification.message}
        </p>
        <span className="mt-1 block text-[10px] text-muted-foreground">
          {timeStr}
        </span>
      </div>
    </div>
  )
}
