"use client"

import { useRouter } from "next/navigation"
import { HandHelping } from "lucide-react"
import { cn } from "@/lib/utils"
import { MemberAvatar } from "@/components/member-avatar"

interface AppHeaderProps {
  teamName: string
  onSos: () => void
  userAvatarUrl?: string
  userName?: string
}

export function AppHeader({ teamName, onSos, userAvatarUrl, userName }: AppHeaderProps) {
  const router = useRouter()

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
            onClick={() => router.push("/dashboard/settings")}
            className="transition-opacity hover:opacity-80"
            aria-label="設定"
          >
            <MemberAvatar
              src={userAvatarUrl}
              name={userName || "?"}
              size="sm"
            />
          </button>
        </div>
      </div>
    </header>
  )
}
