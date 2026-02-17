"use client"

import { Timer, TrendingUp, Flame } from "lucide-react"
import { RopeVisual } from "@/components/rope-visual"
import { cn } from "@/lib/utils"
import type { Team } from "@/lib/mock-data"

interface DashboardHomeProps {
  team: Team
  countdown: string
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    synced: { label: "完了", color: "bg-accent text-accent-foreground" },
    pending: { label: "未完了", color: "bg-warning text-warning-foreground" },
    expired: { label: "期限切れ", color: "bg-destructive text-destructive-foreground" },
  }
  const c = config[status as keyof typeof config] || config.pending
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", c.color)}>
      {c.label}
    </span>
  )
}

export function DashboardHome({ team, countdown }: DashboardHomeProps) {
  const hpPercent = (team.hp / team.maxHp) * 100
  const hpColor =
    hpPercent > 70
      ? "text-accent"
      : hpPercent > 40
        ? "text-warning"
        : "text-destructive"
  const hpBarColor =
    hpPercent > 70
      ? "bg-accent"
      : hpPercent > 40
        ? "bg-warning"
        : "bg-destructive"

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      {/* Team Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-foreground">{team.name}</h1>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="h-3 w-3 text-primary" />
            <span>{team.streakDays}日連続</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Timer className="h-4 w-4 text-primary" />
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">期限まで</div>
            <div className="font-mono text-sm font-bold text-foreground">{countdown}</div>
          </div>
        </div>
      </div>

      {/* Rope & HP */}
      <div className="relative mb-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col items-center">
          <RopeVisual hp={team.hp} size={160} />
          <div className="mt-4 flex items-baseline gap-2">
            <span className={cn("text-4xl font-black animate-count-pulse", hpColor)}>
              {team.hp}
            </span>
            <span className="text-sm text-muted-foreground">/ {team.maxHp} HP</span>
          </div>
          {/* HP Bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", hpBarColor)}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {hpPercent > 70 && "縄はしっかり結ばれている"}
            {hpPercent > 40 && hpPercent <= 70 && "縄がほつれ始めている..."}
            {hpPercent > 10 && hpPercent <= 40 && "縄が大きく損傷している！"}
            {hpPercent <= 10 && "崩壊寸前...！"}
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold text-foreground">メンバー状況</h2>
        <div className="flex flex-col gap-3">
          {team.members.map((member) => (
            <div
              key={member.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 transition-colors",
                member.status === "synced"
                  ? "border-accent/20 bg-accent/5"
                  : member.status === "pending"
                    ? "border-warning/20 bg-warning/5"
                    : "border-destructive/20 bg-destructive/5"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  member.status === "synced"
                    ? "bg-accent/20 text-accent"
                    : member.status === "pending"
                      ? "bg-warning/20 text-warning"
                      : "bg-destructive/20 text-destructive"
                )}
              >
                {member.avatar}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {member.name}
                  </span>
                  <StatusBadge status={member.status} />
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {member.exerciseType === "running" ? (
                    <>
                      {member.todayDistance ?? 0}km / {member.todayGoal}km
                    </>
                  ) : (
                    <>
                      {member.gymMinutes ?? 0}分 / {member.gymGoal}分
                    </>
                  )}
                </div>
              </div>

              {/* Progress Ring */}
              <div className="shrink-0">
                <ProgressRing
                  value={
                    member.exerciseType === "running"
                      ? ((member.todayDistance ?? 0) / (member.todayGoal ?? 1)) * 100
                      : ((member.gymMinutes ?? 0) / (member.gymGoal ?? 1)) * 100
                  }
                  status={member.status}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            累計走行距離
          </div>
          <div className="mt-1 text-2xl font-black text-foreground">
            {team.totalDistance}
            <span className="text-sm font-normal text-muted-foreground">km</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            累計ジム時間
          </div>
          <div className="mt-1 text-2xl font-black text-foreground">
            {team.totalGymHours}
            <span className="text-sm font-normal text-muted-foreground">h</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressRing({ value, status }: { value: number; status: string }) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const radius = 16
  const stroke = 3
  const normalizedRadius = radius - stroke
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference
  const color =
    status === "synced"
      ? "stroke-accent"
      : status === "pending"
        ? "stroke-warning"
        : "stroke-destructive"

  return (
    <svg height={radius * 2} width={radius * 2} className="-rotate-90">
      <circle
        stroke="hsl(var(--secondary))"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className={cn("transition-all duration-700", color)}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  )
}
