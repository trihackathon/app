"use client"

import { useState, useMemo } from "react"
import { MapPin, Clock, Footprints, Check, X, MessageSquare, Loader2, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/components/dashboard-context"
import { postActivityReview, getActivityReviews } from "@/lib/api/endpoints"
import { useToast } from "@/hooks/use-toast"
import type { ActivityResponse, ActivityReviewResponse } from "@/types/api"

type SortOption = "date-desc" | "date-asc" | "distance-desc" | "distance-asc" | "duration-desc" | "duration-asc"

export function ReviewScreen() {
  const { activities, user } = useDashboard()
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")

  const completedActivities = activities.filter((a) => a.status === "completed")
  const inProgressActivities = activities.filter((a) => a.status === "in_progress")

  // ソートされた完了済みアクティビティ
  const sortedCompletedActivities = useMemo(() => {
    const sorted = [...completedActivities]
    
    switch (sortBy) {
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
      case "distance-desc":
        return sorted.sort((a, b) => (b.distance_km || 0) - (a.distance_km || 0))
      case "distance-asc":
        return sorted.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))
      case "duration-desc":
        return sorted.sort((a, b) => (b.duration_min || 0) - (a.duration_min || 0))
      case "duration-asc":
        return sorted.sort((a, b) => (a.duration_min || 0) - (b.duration_min || 0))
      default:
        return sorted
    }
  }, [completedActivities, sortBy])

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="mb-2 text-xl font-black text-foreground">活動履歴</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        チームメンバーの運動記録を確認・レビューできます
      </p>

      {inProgressActivities.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-warning">
            進行中 ({inProgressActivities.length})
          </h2>
          <div className="flex flex-col gap-4">
            {inProgressActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} currentUserId={user?.id} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            完了済み ({completedActivities.length})
          </h2>
          
          {/* ソート選択 */}
          {completedActivities.length > 0 && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none rounded-lg border border-border bg-secondary px-3 py-1.5 pr-8 text-xs text-foreground hover:bg-secondary/80 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="date-desc">新しい順</option>
                <option value="date-asc">古い順</option>
                <option value="distance-desc">距離：長い順</option>
                <option value="distance-asc">距離：短い順</option>
                <option value="duration-desc">時間：長い順</option>
                <option value="duration-asc">時間：短い順</option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          {sortedCompletedActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} currentUserId={user?.id} />
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

function ReviewStatusBadge({ status }: { status?: string }) {
  if (!status || status === "pending") {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
        未レビュー
      </span>
    )
  }
  if (status === "approved") {
    return (
      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
        承認済み
      </span>
    )
  }
  if (status === "rejected") {
    return (
      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
        却下
      </span>
    )
  }
  return null
}

function ActivityCard({ activity, currentUserId }: { activity: ActivityResponse; currentUserId?: string }) {
  const time = new Date(activity.started_at)
  const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`

  const isRunning = activity.exercise_type === "running"
  const statusLabel = activity.status === "completed" ? "完了" : activity.status === "in_progress" ? "進行中" : activity.status
  const statusColor = activity.status === "completed" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"

  const isOwnActivity = activity.user_id === currentUserId
  const canReview = activity.status === "completed" && !isOwnActivity

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviews, setReviews] = useState<ActivityReviewResponse[]>([])
  const [showReviews, setShowReviews] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const { refreshActivities } = useDashboard()
  const { toast } = useToast()

  const handleReview = async (status: "approved" | "rejected") => {
    setIsSubmitting(true)
    const result = await postActivityReview(activity.id, { status, comment })
    setIsSubmitting(false)
    if (result.ok) {
      setShowReviewForm(false)
      setComment("")
      setReviewSubmitted(true)
      refreshActivities()
      toast({
        title: status === "approved" ? "✓ 承認しました" : "✗ 却下しました",
        description: `${activity.user_name}さんの活動をレビューしました`,
      })
    } else {
      toast({
        title: "エラー",
        description: "レビューの投稿に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleShowReviews = async () => {
    if (showReviews) {
      setShowReviews(false)
      return
    }
    setLoadingReviews(true)
    const result = await getActivityReviews(activity.id)
    setLoadingReviews(false)
    if (result.ok) {
      setReviews(result.data)
      setShowReviews(true)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {isRunning ? "R" : "G"}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              {isRunning ? "ランニング" : "ジム"}
              {activity.user_name && (
                <span className="text-xs font-normal text-muted-foreground">
                  by {activity.user_name}
                </span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground">{timeStr}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {activity.status === "completed" && <ReviewStatusBadge status={activity.review_status} />}
          <div className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", statusColor)}>
            {statusLabel}
          </div>
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

      {/* Review Actions */}
      {canReview && !reviewSubmitted && (
        <div className="border-t border-border pt-3">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              レビューする
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="コメント（任意）"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleReview("approved")}
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent hover:bg-accent/20 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  承認
                </button>
                <button
                  onClick={() => handleReview("rejected")}
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                  却下
                </button>
                <button
                  onClick={() => { setShowReviewForm(false); setComment("") }}
                  className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review submitted confirmation */}
      {reviewSubmitted && (
        <div className="border-t border-border pt-3">
          <p className="text-xs text-accent font-medium">レビュー済み</p>
        </div>
      )}

      {/* Show Reviews */}
      {activity.status === "completed" && (
        <div className={cn("pt-2", !canReview && !reviewSubmitted && "border-t border-border")}>
          <button
            onClick={handleShowReviews}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
          >
            {loadingReviews ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <MessageSquare className="h-3 w-3" />
            )}
            {showReviews ? "レビューを隠す" : "レビューを表示"}
          </button>

          {showReviews && reviews.length > 0 && (
            <div className="mt-2 space-y-2">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg bg-secondary p-2">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-bold text-foreground">{review.reviewer_name}</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 font-bold",
                      review.status === "approved" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                    )}>
                      {review.status === "approved" ? "承認" : "却下"}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-1 text-[10px] text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {showReviews && reviews.length === 0 && (
            <p className="mt-2 text-[10px] text-muted-foreground">まだレビューがありません</p>
          )}
        </div>
      )}
    </div>
  )
}
