"use client"

import { useState, useEffect, useRef } from "react"
import { Copy, Check, Users, Footprints, Dumbbell, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RopeVisual } from "@/components/rope-visual"
import { createTeam, createGoal, createInvite, getTeam, joinTeam } from "@/lib/api/endpoints"

interface TeamCreationProps {
  onComplete: () => void
  onBack: () => void
}

type Step = "mode" | "goal" | "invite" | "waiting"
type CreateMode = "create" | "join"

export function TeamCreation({ onComplete, onBack }: TeamCreationProps) {
  const [createMode, setCreateMode] = useState<CreateMode | null>(null)
  const [step, setStep] = useState<Step>("mode")
  const [exerciseType, setExerciseType] = useState<"running" | "gym" | null>(null)
  const [teamName, setTeamName] = useState("")
  const [weeklyGoal, setWeeklyGoal] = useState(15)
  const [gymDays, setGymDays] = useState(3)
  const [gymMinutes, setGymMinutes] = useState(30)
  const [copied, setCopied] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [teamId, setTeamId] = useState<string | null>(null)
  const [memberCount, setMemberCount] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreateAndInvite = async () => {
    if (!exerciseType || !teamName.trim()) {
      setError("チーム名を入力してください")
      return
    }

    setError(null)
    setLoading(true)

    try {
      // 1. Create team
      const teamResult = await createTeam({
        name: teamName.trim(),
        exercise_type: exerciseType,
        strictness: "normal",
      })

      if (!teamResult.ok) {
        setError("チーム作成に失敗しました")
        setLoading(false)
        return
      }

      const newTeamId = teamResult.data.id
      setTeamId(newTeamId)

      // 2. Create goal
      const goalBody = exerciseType === "running"
        ? { target_distance_km: weeklyGoal }
        : { target_visits_per_week: gymDays, target_min_duration_min: gymMinutes }

      const goalResult = await createGoal(newTeamId, goalBody)
      if (!goalResult.ok) {
        setError("目標の設定に失敗しました")
        setLoading(false)
        return
      }

      // 3. Create invite
      const inviteResult = await createInvite(newTeamId)
      if (inviteResult.ok) {
        setInviteCode(inviteResult.data.code)
      } else {
        setError("招待コードの生成に失敗しました")
        setLoading(false)
        return
      }

      setStep("invite")
    } catch {
      setError("エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleWait = () => {
    if (!teamId) return
    setStep("waiting")

    // Poll for member count
    pollingRef.current = setInterval(async () => {
      const result = await getTeam(teamId)
      if (result.ok) {
        const count = result.data.members.length
        setMemberCount(count)
        if (count >= 3) {
          if (pollingRef.current) clearInterval(pollingRef.current)
          setTimeout(onComplete, 1500)
        }
      }
    }, 3000)
  }

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) {
      setError("招待コードを入力してください")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const result = await joinTeam({ code: joinCode.trim() })
      if (!result.ok) {
        setError("チーム参加に失敗しました。コードを確認してください。")
        setLoading(false)
        return
      }

      if (result.data.team_ready) {
        onComplete()
      } else {
        setTeamId(result.data.team.id)
        setMemberCount(result.data.team.members.length)
        setStep("waiting")

        // Poll for remaining members
        pollingRef.current = setInterval(async () => {
          const teamResult = await getTeam(result.data.team.id)
          if (teamResult.ok) {
            const count = teamResult.data.members.length
            setMemberCount(count)
            if (count >= 3) {
              if (pollingRef.current) clearInterval(pollingRef.current)
              setTimeout(onComplete, 1500)
            }
          }
        }, 3000)
      }
    } catch {
      setError("エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  // Mode selection: create vs join
  if (createMode === null) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          戻る
        </button>

        <h1 className="mb-2 text-2xl font-black text-foreground">チームに参加</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          新しくチームを作成するか、招待コードで参加しましょう
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setCreateMode("create")}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">チームを作成</div>
              <div className="text-xs text-muted-foreground">新しいチームを作成して仲間を招待</div>
            </div>
          </button>

          <button
            onClick={() => setCreateMode("join")}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <ArrowRight className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">招待コードで参加</div>
              <div className="text-xs text-muted-foreground">既存のチームに参加する</div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // Join team with code
  if (createMode === "join") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
        <button
          onClick={() => setCreateMode(null)}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          戻る
        </button>

        <h1 className="mb-2 text-2xl font-black text-foreground">招待コードで参加</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          チームメイトから受け取った招待コードを入力してください
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-6">
          <label htmlFor="join-code" className="mb-2 block text-sm font-bold text-foreground">
            招待コード
          </label>
          <input
            id="join-code"
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="例: TK-XXXX-XXXX"
            className="w-full rounded-lg border border-border bg-secondary p-3 text-center font-mono text-lg tracking-widest text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="mt-auto pt-8">
          <Button
            onClick={handleJoinTeam}
            disabled={!joinCode.trim() || loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "参加中..." : "チームに参加"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Create team flow
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
      {/* Back Button */}
      <button
        onClick={step === "mode" ? () => setCreateMode(null) : () => {
          const steps: Step[] = ["mode", "goal", "invite", "waiting"]
          const currentIdx = steps.indexOf(step)
          if (currentIdx > 0) setStep(steps[currentIdx - 1])
        }}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        戻る
      </button>

      {/* Progress */}
      <div className="mb-8 flex gap-2">
        {["mode", "goal", "invite", "waiting"].map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full",
              i <= ["mode", "goal", "invite", "waiting"].indexOf(step)
                ? "bg-primary"
                : "bg-secondary"
            )}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {step === "mode" && (
        <div className="flex flex-1 flex-col">
          <h1 className="mb-2 text-2xl font-black text-foreground">運動タイプを選択</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            あなたの主な運動方法を選んでください
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setExerciseType("running")}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-6 text-left transition-colors",
                exerciseType === "running"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                exerciseType === "running" ? "bg-primary/20" : "bg-secondary"
              )}>
                <Footprints className={cn("h-6 w-6", exerciseType === "running" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">ランニング</div>
                <div className="text-xs text-muted-foreground">GPS軌跡で距離を自動計測</div>
              </div>
            </button>

            <button
              onClick={() => setExerciseType("gym")}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-6 text-left transition-colors",
                exerciseType === "gym"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                exerciseType === "gym" ? "bg-primary/20" : "bg-secondary"
              )}>
                <Dumbbell className={cn("h-6 w-6", exerciseType === "gym" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">ジム</div>
                <div className="text-xs text-muted-foreground">ジオフェンスで滞在時間を自動検知</div>
              </div>
            </button>
          </div>

          <div className="mt-auto pt-8">
            <Button
              onClick={() => setStep("goal")}
              disabled={!exerciseType}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              次へ
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "goal" && (
        <div className="flex flex-1 flex-col">
          <h1 className="mb-2 text-2xl font-black text-foreground">チーム情報 & 目標</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            チーム名と目標を設定しましょう
          </p>

          {/* Team Name */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <label htmlFor="team-name" className="mb-4 block text-sm font-bold text-foreground">
              チーム名
            </label>
            <input
              id="team-name"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="例: 鉄の意志"
              className="w-full rounded-lg border border-border bg-secondary p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {exerciseType === "running" ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <label htmlFor="weekly-goal" className="mb-4 block text-sm font-bold text-foreground">
                週間走行距離
              </label>
              <div className="mb-4 text-center">
                <span className="text-5xl font-black text-primary">{weeklyGoal}</span>
                <span className="ml-1 text-lg text-muted-foreground">km / 週</span>
              </div>
              <input
                id="weekly-goal"
                type="range"
                min={5}
                max={50}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>5km</span>
                <span>50km</span>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                1日あたり約{(weeklyGoal / 7).toFixed(1)}km（週7日の場合）
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <label htmlFor="gym-days" className="mb-4 block text-sm font-bold text-foreground">
                  週のジム通い回数
                </label>
                <div className="mb-4 text-center">
                  <span className="text-5xl font-black text-primary">{gymDays}</span>
                  <span className="ml-1 text-lg text-muted-foreground">回 / 週</span>
                </div>
                <input
                  id="gym-days"
                  type="range"
                  min={1}
                  max={7}
                  value={gymDays}
                  onChange={(e) => setGymDays(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <label htmlFor="gym-minutes" className="mb-4 block text-sm font-bold text-foreground">
                  1回あたりの最低滞在時間
                </label>
                <div className="mb-4 text-center">
                  <span className="text-5xl font-black text-primary">{gymMinutes}</span>
                  <span className="ml-1 text-lg text-muted-foreground">分</span>
                </div>
                <input
                  id="gym-minutes"
                  type="range"
                  min={15}
                  max={120}
                  step={5}
                  value={gymMinutes}
                  onChange={(e) => setGymMinutes(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          )}

          <div className="mt-auto pt-8">
            <Button
              onClick={handleCreateAndInvite}
              disabled={!teamName.trim() || loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "作成中..." : "チームを作成"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "invite" && (
        <div className="flex flex-1 flex-col">
          <h1 className="mb-2 text-2xl font-black text-foreground">仲間を招待</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            招待コードを共有して、3人チームを結成しましょう
          </p>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 text-center text-xs text-muted-foreground">招待コード</div>
            <div className="mb-4 flex items-center justify-center gap-3">
              <code className="text-2xl font-black tracking-widest text-primary">
                {inviteCode}
              </code>
              <button
                onClick={handleCopy}
                className="rounded-lg bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="コピー"
              >
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              このコードを2人の仲間に共有してください
            </p>
          </div>

          <div className="mt-auto pt-8">
            <Button
              onClick={handleWait}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              メンバーを待つ
              <Users className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "waiting" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-8">
            <RopeVisual hp={memberCount * 33} size={160} />
          </div>

          <h1 className="mb-4 text-2xl font-black text-foreground">
            メンバー参加中...
          </h1>

          <div className="mb-8 w-full">
            <div className="flex items-center justify-center gap-2 text-lg font-bold text-foreground">
              <Users className="h-5 w-5 text-primary" />
              {memberCount} / 3 参加済み
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              仲間が招待コードで参加するのを待っています...
            </p>
          </div>

          {memberCount >= 3 && (
            <div className="animate-float-up text-lg font-black text-accent">
              チーム結成完了！
            </div>
          )}
        </div>
      )}
    </div>
  )
}
