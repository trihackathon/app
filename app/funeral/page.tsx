"use client"

import { useRouter } from "next/navigation"
import { FuneralMode } from "@/components/funeral-mode"
import { AuthGuard } from "@/components/auth-guard"

export default function FuneralPage() {
  const router = useRouter()

  return (
    <AuthGuard>
      <FuneralMode
        onRetry={() => router.push("/create-team")}
        onBackToLanding={() => router.push("/")}
      />
    </AuthGuard>
  )
}
