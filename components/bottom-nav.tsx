"use client"

import { Home, Activity, Users, Bell, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  active: string
  onNavigate: (page: string) => void
  unreadCount?: number
}

const navItems = [
  { id: "home", icon: Home, label: "ホーム" },
  { id: "tracking", icon: Activity, label: "記録" },
  { id: "review", icon: Users, label: "レビュー" },
  { id: "notifications", icon: Bell, label: "通知" },
  { id: "stats", icon: BarChart3, label: "分析" },
]

export function BottomNav({ active, onNavigate, unreadCount = 0 }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
              {item.id === "notifications" && unreadCount > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
