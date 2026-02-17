"use client"

import { useRouter } from "next/navigation"
import { TeamCreation } from "@/components/team-creation"

export default function CreateTeamPage() {
  const router = useRouter()

  return (
    <TeamCreation
      onComplete={() => router.push("/dashboard")}
      onBack={() => router.push("/")}
    />
  )
}
