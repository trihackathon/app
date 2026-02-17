'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-accent"
        disabled
      >
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-accent"
      aria-label="テーマ切り替え"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-foreground transition-transform duration-200 hover:rotate-180" />
      ) : (
        <Moon className="h-5 w-5 text-foreground transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  )
}
