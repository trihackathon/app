"use client";

import { useState } from "react";
import type { useAuth } from "@/hooks/use-auth";
import { JsonDisplay } from "./json-display";

type AuthSectionProps = {
  auth: ReturnType<typeof useAuth>;
};

export function AuthSection({ auth }: AuthSectionProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "signUp") {
        await auth.signUpWithEmail(email, password);
      } else {
        await auth.signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "認証エラー");
    }
  };

  if (auth.loading) {
    return <Section title="Authentication"><p>Loading...</p></Section>;
  }

  return (
    <Section title="Authentication">
      {auth.user ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              Signed In
            </span>
            <button onClick={auth.signOut} className={btnDanger}>
              Sign Out
            </button>
            <button onClick={auth.refreshToken} className={btnSecondary}>
              Refresh Token
            </button>
          </div>
          <JsonDisplay
            label="User Info"
            data={{
              uid: auth.user.uid,
              email: auth.user.email,
              displayName: auth.user.displayName,
            }}
          />
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              ID Token (先頭100文字)
            </p>
            <code className="block break-all rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
              {auth.idToken?.slice(0, 100)}...
            </code>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("signIn")}
              className={mode === "signIn" ? btnPrimary : btnSecondary}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signUp")}
              className={mode === "signUp" ? btnPrimary : btnSecondary}
            >
              Sign Up
            </button>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
            required
          />
          <input
            type="password"
            placeholder="Password (6文字以上)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
            required
          />
          <button type="submit" className={btnPrimary}>
            {mode === "signUp" ? "Sign Up" : "Sign In"}
          </button>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </form>
      )}
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      {children}
    </section>
  );
}

// Shared styles
const btnPrimary =
  "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors";
const btnSecondary =
  "rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors";
const btnDanger =
  "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors";
const input =
  "w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100";
