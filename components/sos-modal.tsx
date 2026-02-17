"use client"

import { useState, useEffect } from "react"
import { HandHelping, X, Check, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TeamMemberResponse } from "@/types/api"

interface SosModalProps {
  isOpen: boolean
  onClose: () => void
  memberName: string
  sosRemaining: number
  teamMembers: TeamMemberResponse[]
  currentUserId: string
}

export function SosModal({ isOpen, onClose, memberName, sosRemaining, teamMembers, currentUserId }: SosModalProps) {
  const [step, setStep] = useState<"request" | "voting" | "result">("request")
  const [reason, setReason] = useState("")

  // Build voters from team members excluding current user
  const otherMembers = teamMembers.filter((m) => m.user_id !== currentUserId)
  const [votes, setVotes] = useState<{ name: string; approved: boolean | null }[]>(
    otherMembers.map((m) => ({ name: m.name, approved: null }))
  )

  // Reset votes when members change
  useEffect(() => {
    setVotes(otherMembers.map((m) => ({ name: m.name, approved: null })))
  }, [teamMembers, currentUserId])

  if (!isOpen) return null

  const handleSubmit = () => {
    const voterNames = otherMembers.map((m) => m.name)
    setVotes(voterNames.map((name) => ({ name, approved: null })))
    setStep("voting")

    // Simulate voting (SOS API未実装のため)
    if (voterNames.length >= 1) {
      setTimeout(() => {
        setVotes((prev) =>
          prev.map((v, i) => (i === 0 ? { ...v, approved: true } : v))
        )
      }, 1500)
    }
    if (voterNames.length >= 2) {
      setTimeout(() => {
        setVotes((prev) => prev.map((v) => ({ ...v, approved: true })))
        setStep("result")
      }, 3000)
    } else {
      setTimeout(() => {
        setStep("result")
      }, 2000)
    }
  }

  const handleClose = () => {
    setStep("request")
    setReason("")
    setVotes(otherMembers.map((m) => ({ name: m.name, approved: null })))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandHelping className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-black text-foreground">SOS救済</h2>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "request" && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              今日の運動が困難な場合、チームメイトの承認でノーペナルティになります。
            </p>
            <div className="mb-4 rounded-lg bg-secondary p-3 text-center text-sm">
              <span className="text-muted-foreground">残り使用回数: </span>
              <span className={cn("font-bold", sosRemaining > 0 ? "text-accent" : "text-destructive")}>
                {sosRemaining}回
              </span>
              <span className="text-muted-foreground"> / 月1回</span>
            </div>

            <div className="mb-4">
              <label htmlFor="sos-reason" className="mb-1 block text-xs font-bold text-foreground">
                理由
              </label>
              <textarea
                id="sos-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="体調不良、仕事の都合など..."
                className="w-full rounded-lg border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!reason || sosRemaining === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              SOS申請を送信
            </Button>
            {sosRemaining === 0 && (
              <p className="mt-2 text-center text-xs text-destructive">
                今月のSOS使用回数を使い切りました
              </p>
            )}
          </>
        )}

        {step === "voting" && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {memberName}さんのSOS申請を投票中...
            </p>
            <div className="flex flex-col gap-3">
              {votes.map((vote) => (
                <div
                  key={vote.name}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <span className="text-sm text-foreground">{vote.name}</span>
                  {vote.approved === null ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
                  ) : vote.approved ? (
                    <Check className="h-5 w-5 text-accent" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {step === "result" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-black text-foreground">承認されました</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              今日はノーペナルティです。ゆっくり休んでください。
            </p>
            <Button onClick={handleClose} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              閉じる
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
