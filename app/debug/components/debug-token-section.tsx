"use client";

import { useState } from "react";
import type { useAuth } from "@/hooks/use-auth";
import { debugToken } from "@/lib/api/endpoints";
import { JsonDisplay } from "./json-display";

type DebugTokenSectionProps = {
  auth: ReturnType<typeof useAuth>;
};

export function DebugTokenSection({ auth }: DebugTokenSectionProps) {
  const [uid, setUid] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!uid.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await debugToken(uid);
    if (!res.ok) {
      setError(res.error.error);
      setLoading(false);
      return;
    }

    setResult(res.data);
    setLoading(false);
  };

  const handleSignInWithToken = async () => {
    if (!result || typeof result !== "object") return;
    const token = (result as { custom_token: string }).custom_token;
    if (!token) return;

    try {
      setError(null);
      await auth.signInWithDebugToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "サインインエラー");
    }
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Debug Token
      </h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Firebase UID"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !uid.trim()}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "生成中..." : "トークン生成"}
          </button>
        </div>
        {result != null ? (
          <div className="space-y-3">
            <JsonDisplay data={result} label="Response" />
            <button
              onClick={handleSignInWithToken}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              このトークンでサインイン
            </button>
          </div>
        ) : null}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </section>
  );
}
