"use client"

import { useState } from "react"
import { Copy, Check, Users, Footprints, Dumbbell, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RopeVisual } from "@/components/rope-visual"

interface TeamCreationProps {
  onComplete: () => void
  onBack: () => void
}

type Step = "mode" | "goal" | "invite" | "waiting"

export function TeamCreation({ onComplete, onBack }: TeamCreationProps) {
  const [step, setStep] = useState<Step>("mode")
  const [exerciseType, setExerciseType] = useState<"running" | "gym" | null>(null)
  const [weeklyGoal, setWeeklyGoal] = useState(15)
  const [gymDays, setGymDays] = useState(3)
  const [gymMinutes, setGymMinutes] = useState(30)
  const [copied, setCopied] = useState(false)
  const [joinedCount, setJoinedCount] = useState(1)

  const inviteCode = "TK-X7F9-2026"

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWait = () => {
    setStep("waiting")
    // Simulate members joining
    setTimeout(() => setJoinedCount(2), 2000)
    setTimeout(() => {
      setJoinedCount(3)
      setTimeout(onComplete, 1500)
    }, 4000)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
      {/* Back Button */}
      <button
        onClick={step === "mode" ? onBack : () => {
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
          <h1 className="mb-2 text-2xl font-black text-foreground">目標を設定</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            現実的な目標から始めましょう
          </p>

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
              onClick={() => setStep("invite")}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              次へ
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
            <RopeVisual hp={joinedCount * 33} size={160} />
          </div>

          <h1 className="mb-4 text-2xl font-black text-foreground">
            メンバー参加中...
          </h1>

          <div className="mb-8 flex flex-col gap-3 w-full">
            {["田中 太郎（あなた）", "佐藤 花子", "鈴木 健太"].map((name, i) => (
              <div
                key={name}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 transition-all duration-500",
                  i < joinedCount
                    ? "border-accent/20 bg-accent/5"
                    : "border-border bg-card opacity-40"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                  i < joinedCount ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                )}>
                  {name.charAt(0)}
                </div>
                <span className="text-sm font-bold text-foreground">{name}</span>
                {i < joinedCount && (
                  <Check className="ml-auto h-4 w-4 text-accent" />
                )}
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            {joinedCount}/3 参加済み
          </div>

          {joinedCount === 3 && (
            <div className="mt-4 animate-float-up text-lg font-black text-accent">
              チーム結成完了！
            </div>
          )}
        </div>
      )}
    </div>
  )
}
