"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GRADIENTS, FOCUS_STYLES, LINK_STYLES } from "@/lib/constants/colors";
import { getMyTeam } from "@/lib/api/endpoints";

export function LoginPageClient() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // チーム所属に応じて遷移先を振り分け
  const navigateAfterAuth = async () => {
    const teamResult = await getMyTeam();
    if (teamResult.ok) {
      router.push("/dashboard");
    } else {
      router.push("/create-team");
    }
  };

  // ログイン済みの場合はリダイレクト
  useEffect(() => {
    if (!auth.loading && auth.user) {
      navigateAfterAuth();
    }
  }, [auth.loading, auth.user, router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await auth.signInWithEmail(email, password);
      await navigateAfterAuth();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      if (errorMessage.includes("user-not-found")) {
        setError("ユーザーが見つかりません");
      } else if (errorMessage.includes("wrong-password")) {
        setError("パスワードが間違っています");
      } else if (errorMessage.includes("invalid-email")) {
        setError("メールアドレスの形式が正しくありません");
      } else if (errorMessage.includes("too-many-requests")) {
        setError("リクエストが多すぎます。しばらく待ってから再試行してください");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      await auth.signInWithGoogle();
      await navigateAfterAuth();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      if (errorMessage.includes("popup-closed-by-user")) {
        setError("Google認証がキャンセルされました");
      } else if (errorMessage.includes("popup-blocked")) {
        setError("ポップアップがブロックされました。ブラウザの設定を確認してください");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-zinc-600 dark:text-zinc-400">読み込み中...</div>
      </div>
    );
  }

  // ログイン済みの場合は何も表示しない（useEffectでリダイレクト処理中）
  if (auth.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-zinc-600 dark:text-zinc-400">リダイレクト中...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950">
      {/* 左側：ブランディング */}
      <div className={`hidden w-1/2 flex-col justify-between ${GRADIENTS.BACKGROUND} p-12 lg:flex`}>
        <div>
          <Link href="/" className="text-4xl font-bold text-white">
            TK
          </Link>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-5xl font-bold leading-tight text-white">
            仲間を裏切れない<br />から、続く。
          </h1>
          <p className="text-xl text-white/90">
            3人1組の連帯責任で、三日坊主を打ち破る。
          </p>
        </div>

        <div className="text-sm text-white/70">
          © 2026 TRI-KNOT. All rights reserved.
        </div>
      </div>

      {/* 右側：ログインフォーム */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* モバイル用ロゴ */}
          <div className="lg:hidden">
            <Link href="/" className="text-3xl font-bold text-zinc-900 dark:text-white">
              TK
            </Link>
          </div>

          {/* ヘッダー */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
              ログイン
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              アカウントにログインして続ける
            </p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Google認証ボタン */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-zinc-200 bg-white px-4 py-3 font-medium text-zinc-900 transition-all hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleでログイン
          </button>

          {/* 区切り線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                または
              </span>
            </div>
          </div>

          {/* メールアドレスログインフォーム */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition-colors ${FOCUS_STYLES.INPUT} dark:border-zinc-700 dark:bg-zinc-900 dark:text-white`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                required
                className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition-colors ${FOCUS_STYLES.INPUT} dark:border-zinc-700 dark:bg-zinc-900 dark:text-white`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg ${GRADIENTS.BUTTON} px-4 py-3 font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {loading ? "処理中..." : "ログイン"}
            </button>
          </form>

          {/* サインアップリンク */}
          <div className="text-center text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              アカウントをお持ちでない方は
            </span>{" "}
            <Link
              href="/auth/signup"
              className={`font-medium ${LINK_STYLES.PRIMARY}`}
            >
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
