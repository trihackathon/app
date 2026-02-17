"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface MemberAvatarProps {
  src?: string
  name: string
  size?: "sm" | "md"
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
}

export function MemberAvatar({ src, name, size = "md", className }: MemberAvatarProps) {
  const initial = name.charAt(0)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="font-bold">{initial}</AvatarFallback>
    </Avatar>
  )
}
