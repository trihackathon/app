"use client"

import { useRouter } from "next/navigation"
import { TeamCreation } from "@/components/team-creation"
import { AuthGuard } from "@/components/auth-guard"

export default function CreateTeamPage() {
  const router = useRouter()

  return (
    <AuthGuard>
      <TeamCreation
        onComplete={() => router.push("/dashboard")}
        onBack={() => router.push("/")}
      />
    </AuthGuard>
  )
}
