"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RopeVisual } from "@/components/rope-visual"
import { getMyTeam, getTeamStatus, getTeamActivities } from "@/lib/api/endpoints"
import type { TeamResponse, TeamStatusResponse, ActivityResponse } from "@/types/api"

interface FuneralModeProps {
  onRetry: () => void
  onBackToLanding: () => void
}

export function FuneralMode({ onRetry, onBackToLanding }: FuneralModeProps) {
  const [showMessages, setShowMessages] = useState(false)
  const [team, setTeam] = useState<TeamResponse | null>(null)
  const [teamStatus, setTeamStatus] = useState<TeamStatusResponse | null>(null)
  const [activities, setActivities] = useState<ActivityResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const teamResult = await getMyTeam()
      if (!teamResult.ok) {
        setLoading(false)
        return
      }
      setTeam(teamResult.data)

      const [statusResult, activitiesResult] = await Promise.all([
        getTeamStatus(teamResult.data.id),
        getTeamActivities(teamResult.data.id),
      ])

      if (statusResult.ok) setTeamStatus(statusResult.data)
      if (activitiesResult.ok) setActivities(activitiesResult.data)
      setLoading(false)
    }
    loadData()
  }, [])

  // Calculate stats from real data
  const teamName = team?.name ?? "チーム"
  const startedAt = team?.started_at ? new Date(team.started_at) : null
  const totalDays = startedAt
    ? Math.max(1, Math.floor((Date.now() - startedAt.getTime()) / (1000 * 60 * 60 * 24)))
    : 0
  const totalDistanceKm = activities
    .filter((a) => a.exercise_type === "running" && a.distance_km)
    .reduce((sum, a) => sum + (a.distance_km ?? 0), 0)
  const totalGymMinutes = activities
    .filter((a) => a.exercise_type === "gym")
    .reduce((sum, a) => sum + a.duration_min, 0)
  const totalWeeks = teamStatus?.hp_history?.length ?? team?.current_week ?? 0

  const memberNames = team?.members.map((m) => m.name) ?? []

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
      {/* Broken Rope */}
      <div className="mb-8">
        <RopeVisual hp={0} size={180} animated />
      </div>

      <h1 className="mb-2 text-center text-3xl font-black text-foreground">
        縄が切れました
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        チーム「{teamName}」は解散となりました
      </p>

      {/* Memorial Stats */}
      <div className="mb-8 w-full rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-center text-sm font-bold text-muted-foreground">
          メモリアル
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{totalDays}</div>
            <div className="text-xs text-muted-foreground">継続日数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{totalDistanceKm.toFixed(1)}km</div>
            <div className="text-xs text-muted-foreground">総走行距離</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{(totalGymMinutes / 60).toFixed(1)}h</div>
            <div className="text-xs text-muted-foreground">総ジム時間</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{totalWeeks}</div>
            <div className="text-xs text-muted-foreground">経過週数</div>
          </div>
        </div>
      </div>

      {/* GPS Memory Map */}
      <div className="mb-8 w-full overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative h-40">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(hsl(0 0% 50% / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50% / 0.2) 1px, transparent 1px)",
              backgroundSize: "25px 25px",
            }}
          />
          {activities.length > 0 ? (
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 160">
              {activities
                .filter((a) => a.gps_points && a.gps_points.length >= 2)
                .slice(0, 3)
                .map((activity, idx) => {
                  const points = activity.gps_points!
                  const lats = points.map((p) => p.latitude)
                  const lngs = points.map((p) => p.longitude)
                  const minLat = Math.min(...lats)
                  const maxLat = Math.max(...lats)
                  const minLng = Math.min(...lngs)
                  const maxLng = Math.max(...lngs)
                  const rangeX = maxLng - minLng || 0.001
                  const rangeY = maxLat - minLat || 0.001
                  const svgPoints = points.map((p) => ({
                    x: 20 + ((p.longitude - minLng) / rangeX) * 360,
                    y: 140 - ((p.latitude - minLat) / rangeY) * 120,
                  }))
                  const colors = ["hsl(0 84% 60%)", "hsl(142 71% 45%)", "hsl(217 91% 60%)"]
                  const pathD = `M ${svgPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`
                  return (
                    <path
                      key={activity.id}
                      d={pathD}
                      fill="none"
                      stroke={colors[idx % 3]}
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  )
                })}
            </svg>
          ) : (
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 160">
              <path d="M 30 130 Q 80 80 130 90 T 200 60 T 280 50 T 370 30" fill="none" stroke="hsl(0 84% 60%)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <path d="M 40 140 Q 90 100 140 110 T 210 80 T 290 70 T 370 45" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <path d="M 50 120 Q 100 70 150 80 T 220 50 T 300 40 T 370 20" fill="none" stroke="hsl(217 91% 60%)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </svg>
          )}
          <div className="absolute bottom-2 left-2 rounded-md bg-card/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
            {memberNames.length > 0 ? `${memberNames.length}人の思い出のGPS軌跡` : "思い出のGPS軌跡"}
          </div>
        </div>
      </div>

      {/* Messages from members */}
      {memberNames.length > 0 && (
        <>
          {!showMessages ? (
            <button
              onClick={() => setShowMessages(true)}
              className="mb-8 flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Heart className="h-4 w-4" />
              チームメンバーを見る
            </button>
          ) : (
            <div className="mb-8 w-full flex flex-col gap-3 animate-float-up">
              {memberNames.map((name) => (
                <div
                  key={name}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="mb-1 text-xs font-bold text-primary">{name}</div>
                  <p className="text-sm text-foreground">一緒に頑張ってくれてありがとう！</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex w-full flex-col gap-3">
        <Button
          size="lg"
          onClick={onRetry}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          また挑戦する
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onBackToLanding}
          className="w-full border-border text-muted-foreground hover:text-foreground bg-transparent"
        >
          トップに戻る
        </Button>
      </div>
    </div>
  )
}
