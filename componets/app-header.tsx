"use client"

import { HandHelping, Skull } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  teamName: string
  onSos: () => void
  onFuneral: () => void
}

export function AppHeader({ teamName, onSos, onFuneral }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-xs font-black text-primary">TK</span>
          </div>
          <span className="text-sm font-black text-foreground">{teamName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSos}
            className={cn(
              "flex items-center gap-1 rounded-lg border border-primary/20 px-2.5 py-1.5",
              "text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
            )}
            aria-label="SOS救済を申請"
          >
            <HandHelping className="h-3.5 w-3.5" />
            SOS
          </button>
          <button
            onClick={onFuneral}
            className={cn(
              "flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5",
              "text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/20 transition-colors"
            )}
            aria-label="葬式モードを確認"
          >
            <Skull className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
