"use client"

import { useState } from "react"
import { ArrowRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RopeVisual } from "@/components/rope-visual"

interface FuneralModeProps {
  onRetry: () => void
  onBackToLanding: () => void
}

export function FuneralMode({ onRetry, onBackToLanding }: FuneralModeProps) {
  const [showMessages, setShowMessages] = useState(false)

  const memories = {
    totalDays: 12,
    totalDistance: 156.4,
    totalGymHours: 34.5,
    bestStreak: 12,
  }

  const messages = [
    { from: "田中 太郎", message: "12日間お疲れ様でした。また一緒に走ろう！" },
    { from: "佐藤 花子", message: "ジムで一緒に頑張れて楽しかったです。リベンジしましょう！" },
    { from: "鈴木 健太", message: "次はもっと長く続けよう。待ってるぞ！" },
  ]

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
        チーム「鉄の意志」は解散となりました
      </p>

      {/* Memorial Stats */}
      <div className="mb-8 w-full rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-center text-sm font-bold text-muted-foreground">
          メモリアル
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{memories.totalDays}</div>
            <div className="text-xs text-muted-foreground">継続日数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{memories.totalDistance}km</div>
            <div className="text-xs text-muted-foreground">総走行距離</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{memories.totalGymHours}h</div>
            <div className="text-xs text-muted-foreground">総ジム時間</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{memories.bestStreak}日</div>
            <div className="text-xs text-muted-foreground">最長連続</div>
          </div>
        </div>
      </div>

      {/* GPS Memory Map (Simulated) */}
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
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 160">
            {/* Three overlapping GPS trails - one per member */}
            <path
              d="M 30 130 Q 80 80 130 90 T 200 60 T 280 50 T 370 30"
              fill="none"
              stroke="hsl(0 84% 60%)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 40 140 Q 90 100 140 110 T 210 80 T 290 70 T 370 45"
              fill="none"
              stroke="hsl(142 71% 45%)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 50 120 Q 100 70 150 80 T 220 50 T 300 40 T 370 20"
              fill="none"
              stroke="hsl(217 91% 60%)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
          <div className="absolute bottom-2 left-2 rounded-md bg-card/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
            3人の思い出のGPS軌跡
          </div>
        </div>
      </div>

      {/* Messages */}
      {!showMessages ? (
        <button
          onClick={() => setShowMessages(true)}
          className="mb-8 flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Heart className="h-4 w-4" />
          感謝メッセージを見る
        </button>
      ) : (
        <div className="mb-8 w-full flex flex-col gap-3 animate-float-up">
          {messages.map((msg) => (
            <div
              key={msg.from}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-1 text-xs font-bold text-primary">{msg.from}</div>
              <p className="text-sm text-foreground">{msg.message}</p>
            </div>
          ))}
        </div>
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
