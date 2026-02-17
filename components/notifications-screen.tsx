"use client"

import { useState } from "react"
import { Bell, PartyPopper, AlertTriangle, Eye, HandHelping } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockNotifications } from "@/lib/mock-data"
import type { Notification } from "@/lib/mock-data"

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const unread = notifications.filter((n) => !n.read)
  const read = notifications.filter((n) => n.read)

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-black text-foreground">通知</h1>
        {unread.length > 0 && (
          <button
            onClick={() =>
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            }
            className="text-xs text-primary hover:underline"
          >
            すべて既読にする
          </button>
        )}
      </div>

      {unread.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            未読 ({unread.length})
          </h2>
          <div className="flex flex-col gap-2">
            {unread.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
              />
            ))}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            既読
          </h2>
          <div className="flex flex-col gap-2">
            {read.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isRead
              />
            ))}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell className="mb-4 h-12 w-12 opacity-30" />
          <p className="text-sm">通知はありません</p>
        </div>
      )}
    </div>
  )
}

function NotificationCard({
  notification,
  onRead,
  isRead,
}: {
  notification: Notification
  onRead?: () => void
  isRead?: boolean
}) {
  const iconMap = {
    pressure: { icon: Eye, color: "text-warning", bg: "bg-warning/10" },
    celebration: { icon: PartyPopper, color: "text-accent", bg: "bg-accent/10" },
    sos: { icon: HandHelping, color: "text-primary", bg: "bg-primary/10" },
    alert: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    review: { icon: Eye, color: "text-chart-4", bg: "bg-chart-4/10" },
  }

  const config = iconMap[notification.type] || iconMap.alert
  const Icon = config.icon
  const time = new Date(notification.timestamp)
  const timeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`

  return (
    <button
      onClick={onRead}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        isRead
          ? "border-border bg-card opacity-60"
          : "border-primary/10 bg-card hover:border-primary/20"
      )}
    >
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.bg)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1">
        <p className={cn("text-sm", isRead ? "text-muted-foreground" : "text-foreground font-medium")}>
          {notification.message}
        </p>
        <span className="mt-1 block text-[10px] text-muted-foreground">
          {timeStr}
        </span>
      </div>
      {!isRead && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  )
}
