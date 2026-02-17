"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Heart, TrendingUp, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/components/dashboard-context"
import { MemberAvatar } from "@/components/member-avatar"

type Tab = "hp" | "activity" | "risk"

export function StatsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("hp")

  const tabs: { id: Tab; label: string }[] = [
    { id: "hp", label: "HP推移" },
    { id: "activity", label: "活動量" },
    { id: "risk", label: "リスク分析" },
  ]

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="mb-6 text-xl font-black text-foreground">データ分析</h1>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "hp" && <HpTab />}
      {activeTab === "activity" && <ActivityTab />}
      {activeTab === "risk" && <RiskTab />}
    </div>
  )
}

function HpTab() {
  const { teamStatus, team } = useDashboard()

  const hpHistory = teamStatus?.hp_history ?? []
  const chartData = hpHistory.map((h) => ({
    week: `W${h.week}`,
    hp: h.hp_end,
  }))

  const currentHp = team?.current_hp ?? 0
  const maxHp = team?.max_hp ?? 100
  const totalDamage = maxHp - currentHp

  return (
    <div className="flex flex-col gap-6">
      {/* HP Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">HP推移</h3>
        </div>
        <div className="h-48">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(240 4% 16%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "hsl(240 5% 48%)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "hsl(240 5% 48%)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240 4% 10%)",
                    border: "1px solid hsl(240 4% 16%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(0 0% 98%)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hp"
                  stroke="hsl(0 84% 60%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(0 84% 60%)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              まだデータがありません
            </div>
          )}
        </div>
      </div>

      {/* HP Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="text-xl font-black text-foreground">{currentHp}</div>
          <div className="text-[10px] text-muted-foreground">現在HP</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="text-xl font-black text-accent">{maxHp}</div>
          <div className="text-[10px] text-muted-foreground">最高HP</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="text-xl font-black text-destructive">-{totalDamage}</div>
          <div className="text-[10px] text-muted-foreground">累計ダメージ</div>
        </div>
      </div>
    </div>
  )
}

function ActivityTab() {
  const { currentEvaluation, teamStatus } = useDashboard()

  const members = currentEvaluation?.members ?? []

  // Build weekly chart data from member activities
  const chartData: { day: string; [key: string]: string | number }[] = []
  const dayNames = ["月", "火", "水", "木", "金", "土", "日"]

  if (members.length > 0) {
    for (const dayName of dayNames) {
      const entry: { day: string; [key: string]: string | number } = { day: dayName }
      for (const member of members) {
        const dayActivities = member.activities_this_week.filter((a) => {
          const d = new Date(a.date)
          const jDay = d.getDay()
          const dayIndex = jDay === 0 ? 6 : jDay - 1
          return dayNames[dayIndex] === dayName
        })
        entry[member.user_name] = dayActivities.reduce((sum, a) => sum + (a.distance_km ?? 0), 0)
      }
      chartData.push(entry)
    }
  }

  const memberNames = members.map((m) => m.user_name)
  const colors = ["hsl(0 84% 60%)", "hsl(142 71% 45%)", "hsl(217 91% 60%)"]

  return (
    <div className="flex flex-col gap-6">
      {/* Weekly Activity Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">今週の活動量</h3>
        </div>
        <div className="h-48">
          {chartData.length > 0 && memberNames.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(240 4% 16%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(240 5% 48%)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(240 5% 48%)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240 4% 10%)",
                    border: "1px solid hsl(240 4% 16%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(0 0% 98%)",
                  }}
                />
                {memberNames.map((name, i) => (
                  <Bar key={name} dataKey={name} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} name={name} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              まだデータがありません
            </div>
          )}
        </div>
        {memberNames.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            {memberNames.map((name, i) => (
              <div key={name} className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Stats */}
      <div className="flex flex-col gap-3">
        {(teamStatus?.members_progress ?? []).map((member) => (
          <div
            key={member.user_id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <MemberAvatar
                src={member.avatar_url}
                name={member.user_name}
                size="sm"
              />
              <div>
                <div className="text-sm font-bold text-foreground">{member.user_name}</div>
                <div className="text-[10px] text-muted-foreground">
                  進捗: {member.target_progress_percent}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-foreground">
                {(member.current_week_distance_km ?? 0).toFixed(1)}km
              </div>
              <div className="text-[10px] text-muted-foreground">今週の距離</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RiskTab() {
  const { prediction } = useDashboard()

  const dailyStats = prediction?.daily_stats ?? []
  const recommendation = prediction?.recommendation ?? ""
  const dangerDays = prediction?.danger_days ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* Risk Analysis */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <h3 className="text-sm font-bold text-foreground">失敗リスク予測</h3>
        </div>
        {dailyStats.length > 0 ? (
          <div className="flex flex-col gap-3">
            {dailyStats
              .filter((d) => d.is_danger)
              .map((day) => {
                // success_rate は 0.0～1.0 の範囲なので100倍する
                const successPercent = Math.round(day.success_rate * 100)
                const failurePercent = day.activity_count === 0 ? 0 : 100 - successPercent
                
                return (
                  <div key={day.day_of_week} className="flex items-center gap-3">
                    <div className="w-16 text-xs font-bold text-foreground">{day.day_name}</div>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            successPercent < 40 ? "bg-destructive" : successPercent < 60 ? "bg-warning" : "bg-accent"
                          )}
                          style={{ width: `${failurePercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-8 text-right text-xs font-bold text-foreground">
                      {failurePercent}%
                    </div>
                  </div>
                )
              })}
            {dailyStats.filter((d) => d.is_danger).length === 0 && (
              <p className="text-sm text-muted-foreground">危険な曜日はありません</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            まだ十分なデータがありません
          </p>
        )}
        {dangerDays.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            注意が必要な曜日: {dangerDays.join(", ")}
          </p>
        )}
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-bold text-foreground">AIからのアドバイス</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recommendation}
          </p>
        </div>
      )}

      {!recommendation && dailyStats.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-center text-sm text-muted-foreground">
            活動データが蓄積されると、リスク分析が表示されます
          </p>
        </div>
      )}
    </div>
  )
}
