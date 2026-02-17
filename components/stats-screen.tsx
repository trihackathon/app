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
import { Heart, TrendingUp, AlertTriangle, HandHelping } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockTeam, mockWeeklyData, mockHpHistory } from "@/lib/mock-data"

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
  return (
    <div className="flex flex-col gap-6">
      {/* HP Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">HP推移</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockHpHistory}>
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
        </div>
      </div>

      {/* HP Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="text-xl font-black text-foreground">{mockTeam.hp}</div>
          <div className="text-[10px] text-muted-foreground">現在HP</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="text-xl font-black text-accent">100</div>
          <div className="text-[10px] text-muted-foreground">最高HP</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="text-xl font-black text-destructive">-22</div>
          <div className="text-[10px] text-muted-foreground">累計ダメージ</div>
        </div>
      </div>
    </div>
  )
}

function ActivityTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* Weekly Activity Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">今週の活動量</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockWeeklyData}>
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
              <Bar dataKey="you" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} name="あなた" />
              <Bar dataKey="member3" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} name="鈴木" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">あなた (km)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-chart-4" />
            <span className="text-muted-foreground">鈴木 (km)</span>
          </div>
        </div>
      </div>

      {/* Member Stats */}
      <div className="flex flex-col gap-3">
        {mockTeam.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {member.avatar}
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{member.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  信頼スコア: {member.trustScore}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-foreground">
                {member.streak}日
              </div>
              <div className="text-[10px] text-muted-foreground">連続達成</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RiskTab() {
  const riskDays = [
    { day: "月曜日", risk: 72, reason: "週始めのモチベーション低下" },
    { day: "木曜日", risk: 58, reason: "週中の疲労蓄積" },
    { day: "金曜日", risk: 45, reason: "飲み会の誘惑" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Risk Analysis */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <h3 className="text-sm font-bold text-foreground">失敗リスク予測</h3>
        </div>
        <div className="flex flex-col gap-3">
          {riskDays.map((day) => (
            <div key={day.day} className="flex items-center gap-3">
              <div className="w-16 text-xs font-bold text-foreground">{day.day}</div>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      day.risk > 60 ? "bg-destructive" : day.risk > 40 ? "bg-warning" : "bg-accent"
                    )}
                    style={{ width: `${day.risk}%` }}
                  />
                </div>
              </div>
              <div className="w-8 text-right text-xs font-bold text-foreground">
                {day.risk}%
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          過去の達成データから曜日別の失敗確率を算出しています
        </p>
      </div>

      {/* SOS Usage */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <HandHelping className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">SOS使用状況</h3>
        </div>
        <div className="flex flex-col gap-3">
          {mockTeam.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{member.name}</span>
              <span className={cn(
                "text-sm font-bold",
                member.sosRemaining > 0 ? "text-accent" : "text-destructive"
              )}>
                残り{member.sosRemaining}回
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Compatibility Score */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-bold text-foreground">チーム相性スコア</h3>
        <div className="flex items-center justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(240 4% 16%)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(142 71% 45%)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${0.82 * 251.2} ${251.2}`}
              />
            </svg>
            <span className="text-2xl font-black text-foreground">82%</span>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          運動レベル・活動時間帯の一致度が高いチームです
        </p>
      </div>
    </div>
  )
}
