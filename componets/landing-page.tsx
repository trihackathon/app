"use client"

import { useState } from "react"
import { ArrowRight, Shield, MapPin, Zap, Users, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RopeVisual } from "@/components/rope-visual"

interface LandingPageProps {
  onEnter: () => void
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(hsl(0 84% 60% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(0 84% 60% / 0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-12">
          {/* Logo / Nav */}
          <div className="mb-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-lg font-black text-primary">TK</span>
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">
                TRI-KNOT
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onEnter}
              className="border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
            >
              ログイン
            </Button>
          </div>

          {/* Hero Content */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-8">
              <RopeVisual hp={85} size={180} />
            </div>

            <h1 className="mb-4 text-balance text-4xl font-black leading-tight tracking-tight md:text-6xl">
              <span className="text-foreground">仲間を</span>
              <span className="text-primary">裏切れない</span>
              <br />
              <span className="text-foreground">から、続く。</span>
            </h1>

            <p className="mb-8 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              3人1組の連帯責任で、三日坊主を打ち破る。
              GPS自動検証で嘘をつけない。
              仲間の失敗は、全員のダメージ。
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={onEnter}
                className="bg-primary px-8 text-lg font-bold text-primary-foreground hover:bg-primary/90"
              >
                デモを体験する
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                もっと知る
                <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="border-t border-border bg-card/50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-2xl font-black text-foreground md:text-3xl">
            仕組み
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            シンプルだけど逃げられない、3つのステップ
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "3人で結ぶ",
                desc: "招待コードで仲間を集め、運動目標を設定。3人の縄が結ばれる。",
                icon: Users,
              },
              {
                step: "02",
                title: "GPSが証明する",
                desc: "ランニングのGPS軌跡、ジムの滞在時間を自動検証。嘘はつけない。",
                icon: MapPin,
              },
              {
                step: "03",
                title: "裏切ればHPが減る",
                desc: "1人の失敗で全員にダメージ。HP0でチーム解散。縄が切れる。",
                icon: Zap,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl font-black text-primary/30">
                    {item.step}
                  </span>
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      {showMore && (
        <section className="border-t border-border px-6 py-20 animate-float-up">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-black text-foreground md:text-3xl">
              主な機能
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  icon: Shield,
                  title: "不正防止システム",
                  desc: "速度12km/h以上で車移動を検知。ピアレビューで軌跡を相互確認。",
                },
                {
                  icon: Zap,
                  title: "リアルタイム同期",
                  desc: "仲間が運動完了すると即座に通知。量子状態UIで誰が未達成か見えない緊張感。",
                },
                {
                  icon: Users,
                  title: "SOS救済システム",
                  desc: "月1回の緊急回避権。体調不良時に事前申告し、2人の承認でノーペナルティ。",
                },
                {
                  icon: MapPin,
                  title: "3層自動検証",
                  desc: "GPS軌跡・歩数カウント・ジム滞在時間の3層で「やったフリ」を完全排除。",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4 rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HP Visual Demo */}
      <section className="border-t border-border bg-card/50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-2xl font-black text-foreground md:text-3xl">
            縄が切れたら、終わり。
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            HPが減るほど縄がほつれていく
          </p>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { hp: 100, label: "HP 100", desc: "強固な結束" },
              { hp: 65, label: "HP 65", desc: "ほつれ始め" },
              { hp: 30, label: "HP 30", desc: "大きく損傷" },
              { hp: 5, label: "HP 5", desc: "崩壊寸前" },
            ].map((demo) => (
              <div key={demo.hp} className="flex flex-col items-center gap-3">
                <RopeVisual hp={demo.hp} size={120} animated={false} />
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">
                    {demo.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {demo.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="mb-4 text-2xl font-black text-foreground md:text-3xl">
            今日から始める
          </h2>
          <p className="mb-8 text-muted-foreground">
            3人集まれば、もう逃げられない
          </p>
          <Button
            size="lg"
            onClick={onEnter}
            className="bg-primary px-8 text-lg font-bold text-primary-foreground hover:bg-primary/90"
          >
            デモを体験する
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-5xl text-center text-xs text-muted-foreground">
          TRI-KNOT -- 三日坊主を打ち破る、3人連帯責任フィットネス
        </div>
      </footer>
    </div>
  )
}
