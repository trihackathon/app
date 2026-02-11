"use client";

import { useAuth } from "@/hooks/use-auth";
import { AuthSection } from "./components/auth-section";
import { DebugTokenSection } from "./components/debug-token-section";
import { ApiTester } from "./components/api-tester";

export function DebugPageClient() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Debug Console
        </h1>

        <AuthSection auth={auth} />
        <DebugTokenSection auth={auth} />
        <ApiTester />
      </div>
    </div>
  );
}
