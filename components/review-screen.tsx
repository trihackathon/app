"use client"

import { useState } from "react"
import { Check, AlertTriangle, MapPin, Clock, Footprints } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { mockActivities } from "@/lib/mock-data"
import type { ActivityLog } from "@/lib/mock-data"

export function ReviewScreen() {
  const [activities, setActivities] = useState<ActivityLog[]>(mockActivities)

  const handleApprove = (id: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "approved" as const, reviewedBy: [...a.reviewedBy, "user-1"] } : a
      )
    )
  }

  const handleFlag = (id: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "flagged" as const } : a
      )
    )
  }

  const pendingReviews = activities.filter((a) => a.status === "pending_review")
  const completedReviews = activities.filter((a) => a.status !== "pending_review")

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="mb-2 text-xl font-black text-foreground">ピアレビュー</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        仲間の運動記録を確認・承認してください
      </p>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-warning">
            <AlertTriangle className="h-4 w-4" />
            確認待ち ({pendingReviews.length})
          </h2>
          <div className="flex flex-col gap-4">
            {pendingReviews.map((activity) => (
              <ReviewCard
                key={activity.id}
                activity={activity}
                onApprove={() => handleApprove(activity.id)}
                onFlag={() => handleFlag(activity.id)}
                isPending
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Reviews */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-foreground">
          レビュー済み ({completedReviews.length})
        </h2>
        <div className="flex flex-col gap-4">
          {completedReviews.map((activity) => (
            <ReviewCard
              key={activity.id}
              activity={activity}
              isPending={false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ReviewCard({
  activity,
  onApprove,
  onFlag,
  isPending,
}: {
  activity: ActivityLog
  onApprove?: () => void
  onFlag?: () => void
  isPending: boolean
}) {
  const time = new Date(activity.timestamp)
  const timeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4",
        isPending ? "border-warning/30" : "border-border",
        activity.status === "flagged" && "border-destructive/30"
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {activity.memberName.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              {activity.memberName}
            </div>
            <div className="text-[10px] text-muted-foreground">{timeStr}</div>
          </div>
        </div>
        <div
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold",
            activity.status === "approved"
              ? "bg-accent/10 text-accent"
              : activity.status === "flagged"
                ? "bg-destructive/10 text-destructive"
                : "bg-warning/10 text-warning"
          )}
        >
          {activity.status === "approved"
            ? "承認済み"
            : activity.status === "flagged"
              ? "疑義あり"
              : "確認待ち"}
        </div>
      </div>

      {/* Activity Details */}
      <div className="mb-3 flex gap-4 text-sm">
        {activity.type === "running" ? (
          <>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Footprints className="h-3.5 w-3.5" />
              <span className="font-bold text-foreground">{activity.distance}km</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              GPS軌跡あり
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-bold text-foreground">{activity.duration}分</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              ジオフェンス確認済
            </div>
          </>
        )}
      </div>

      {/* GPS Map Preview (Simulated) */}
      {activity.type === "running" && activity.gpsPath && (
        <div className="relative mb-3 h-32 overflow-hidden rounded-lg bg-secondary">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(hsl(0 0% 50% / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50% / 0.2) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 130">
            <path
              d={`M ${activity.gpsPath.map((_, i) => `${30 + i * 60} ${110 - i * 20 + Math.sin(i * 2) * 15}`).join(" L ")}`}
              fill="none"
              stroke="hsl(0 84% 60%)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {activity.gpsPath.map((_, i) => (
              <circle
                key={i}
                cx={30 + i * 60}
                cy={110 - i * 20 + Math.sin(i * 2) * 15}
                r="3"
                fill="hsl(0 84% 60%)"
              />
            ))}
          </svg>
          <div className="absolute bottom-2 left-2 rounded-md bg-card/80 px-2 py-0.5 text-[10px] text-foreground backdrop-blur">
            GPS軌跡マップ
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isPending && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onApprove}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Check className="mr-1 h-4 w-4" />
            承認
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onFlag}
            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent"
          >
            <AlertTriangle className="mr-1 h-4 w-4" />
            疑義あり
          </Button>
        </div>
      )}
    </div>
  )
}
