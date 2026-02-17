"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { createMe } from "@/lib/api/endpoints";
import Link from "next/link";
import Image from "next/image";
import { GRADIENTS, FOCUS_STYLES, LINK_STYLES, INDICATOR_STYLES } from "@/lib/constants/colors";

export function SignupPageClient() {
  const auth = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1: 認証情報
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Step 2: プロフィール情報
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [chronotype, setChronotype] = useState("both");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // パスワード強度チェック
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return null;
    if (pass.length < 6) return { level: "weak", text: "弱い（6文字以上必要）" };
    if (pass.length < 8) return { level: "medium", text: "中程度" };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass))
      return { level: "strong", text: "強い" };
    return { level: "medium", text: "中程度" };
  };

  const passwordStrength = getPasswordStrength(password);

  // 画像選択ハンドラー
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("画像サイズは5MB以下にしてください");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        setError("画像ファイルを選択してください");
        return;
      }
      
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarRemove = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);

    try {
      await auth.signInWithGoogle();
      // Google認証の場合はStep 2に進む
      setStep(2);
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

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    setLoading(true);

    try {
      await auth.signUpWithEmail(email, password);
      setStep(2);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      if (errorMessage.includes("email-already-in-use")) {
        setError("このメールアドレスは既に使用されています");
      } else if (errorMessage.includes("invalid-email")) {
        setError("メールアドレスの形式が正しくありません");
      } else if (errorMessage.includes("weak-password")) {
        setError("パスワードが弱すぎます（6文字以上必要）");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }

    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) {
      setError("年齢を正しく入力してください");
      return;
    }

    if (!weight.trim() || isNaN(Number(weight)) || Number(weight) <= 0) {
      setError("体重を正しく入力してください");
      return;
    }

    setLoading(true);

    try {
      // Firebase Authのトークンが認識されるまで待つ
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const user = auth.user;
      if (!user) {
        throw new Error("ユーザー情報が取得できませんでした");
      }

      // 新しいトークンを取得
      await user.getIdToken(true);

      // バックエンドにユーザー情報を作成
      const result = await createMe({
        name: name.trim(),
        age: Number(age),
        gender,
        weight: Number(weight),
        chronotype,
        avatar: avatar || undefined,
      });

      if (result.ok) {
        router.push("/create-team");
      } else {
        const errorMsg = result.error.error || "不明なエラー";
        setError(`ユーザー情報の作成に失敗しました: ${errorMsg}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "不明なエラー";
      setError(`ユーザー情報の作成に失敗しました: ${errorMessage}`);
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
            3人で結ぶ。<br />GPSが証明する。<br />裏切ればHPが減る。
          </h1>
          <p className="text-xl text-white/90">
            仲間を裏切れないから、続く。
          </p>
        </div>

        <div className="text-sm text-white/70">
          © 2026 TRI-KNOT. All rights reserved.
        </div>
      </div>

      {/* 右側：登録フォーム */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* モバイル用ロゴ */}
          <div className="lg:hidden">
            <Link href="/" className="text-3xl font-bold text-zinc-900 dark:text-white">
              TK
            </Link>
          </div>

          {/* ステップインジケーター */}
          <div className="flex items-center justify-center gap-2">
            <div
              className={`h-2 w-2 rounded-full transition-all ${
                step === 1 ? `w-8 ${INDICATOR_STYLES.ACTIVE}` : INDICATOR_STYLES.INACTIVE
              }`}
            />
            <div
              className={`h-2 w-2 rounded-full transition-all ${
                step === 2 ? `w-8 ${INDICATOR_STYLES.ACTIVE}` : INDICATOR_STYLES.INACTIVE
              }`}
            />
          </div>

          {/* ヘッダー */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {step === 1 ? "新規登録" : "プロフィール設定"}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {step === 1
                ? "アカウントを作成して始める"
                : "あなたの情報を入力してください"}
            </p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <>
              {/* Google認証ボタン */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
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
                Googleで登録
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

              {/* メールアドレス登録フォーム */}
              <form onSubmit={handleStep1Submit} className="space-y-4">
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
                  {passwordStrength && (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          強度: {passwordStrength.text}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            passwordStrength.level === "weak"
                              ? "w-1/3 bg-red-500"
                              : passwordStrength.level === "medium"
                                ? "w-2/3 bg-yellow-500"
                                : "w-full bg-green-500"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                    パスワード（確認）
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="もう一度入力してください"
                    required
                    className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition-colors ${FOCUS_STYLES.INPUT} dark:border-zinc-700 dark:bg-zinc-900 dark:text-white`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-lg ${GRADIENTS.BUTTON} px-4 py-3 font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {loading ? "処理中..." : "次へ"}
                </button>
              </form>
            </>
          ) : (
            // Step 2: プロフィール情報
            <form onSubmit={handleStep2Submit} className="space-y-4">
              {/* プロフィール写真 */}
              <div className="flex flex-col items-center">
                <label className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
                  プロフィール写真（任意）
                </label>
                
                {avatarPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-zinc-300 dark:border-zinc-600">
                      <Image
                        src={avatarPreview}
                        alt="プレビュー"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAvatarRemove}
                      className="text-sm text-red-600 hover:underline dark:text-red-400"
                    >
                      削除
                    </button>
                  </div>
                ) : (
                  <label className={`flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors ${FOCUS_STYLES.HOVER_BORDER} dark:border-zinc-600 dark:bg-zinc-800`}>
                    <svg
                      className="h-10 w-10 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                  名前
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田太郎"
                  required
                  className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition-colors ${FOCUS_STYLES.INPUT} dark:border-zinc-700 dark:bg-zinc-900 dark:text-white`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                    年齢
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    min="1"
                    max="150"
                    required
                    className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition-colors ${FOCUS_STYLES.INPUT} dark:border-zinc-700 dark:bg-zinc-900 dark:text-white`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                    体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="60"
                    min="1"
                    max="300"
                    required
                    className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition-colors ${FOCUS_STYLES.INPUT} dark:border-zinc-700 dark:bg-zinc-900 dark:text-white`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                  性別
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition-colors ${FOCUS_STYLES.INPUT} dark:border-zinc-700 dark:bg-zinc-900 dark:text-white`}
                >
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                  朝型・夜型
                </label>
                <select
                  value={chronotype}
                  onChange={(e) => setChronotype(e.target.value)}
                  className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition-colors ${FOCUS_STYLES.INPUT} dark:border-zinc-700 dark:bg-zinc-900 dark:text-white`}
                >
                  <option value="morning">朝型</option>
                  <option value="night">夜型</option>
                  <option value="both">どちらでも</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 rounded-lg border-2 border-zinc-300 px-4 py-3 font-medium text-zinc-900 transition-all hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-800"
                >
                  戻る
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 rounded-lg ${GRADIENTS.BUTTON} px-4 py-3 font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {loading ? "処理中..." : "登録完了"}
                </button>
              </div>
            </form>
          )}

          {/* ログインリンク */}
          {step === 1 && (
            <div className="text-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                既にアカウントをお持ちの方は
              </span>{" "}
              <Link
                href="/auth/login"
                className={`font-medium ${LINK_STYLES.PRIMARY}`}
              >
                ログイン
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
