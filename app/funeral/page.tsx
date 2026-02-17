"use client"

import { useRouter } from "next/navigation"
import { FuneralMode } from "@/components/funeral-mode"

export default function FuneralPage() {
  const router = useRouter()

  return (
    <FuneralMode
      onRetry={() => router.push("/create-team")}
      onBackToLanding={() => router.push("/")}
    />
  )
}
