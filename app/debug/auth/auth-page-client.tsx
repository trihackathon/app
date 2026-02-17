"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createMe } from "@/lib/api/endpoints";
import Image from "next/image";

type Mode = "signin" | "signup";

export function AuthPageClient() {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [chronotype, setChronotype] = useState("both");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenDebugInfo, setTokenDebugInfo] = useState<string | null>(null);

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
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        setError("画像サイズは5MB以下にしてください");
        return;
      }
      
      // 画像形式チェック
      if (!file.type.startsWith("image/")) {
        setError("画像ファイルを選択してください");
        return;
      }
      
      setAvatar(file);
      
      // プレビュー表示
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 画像削除ハンドラー
  const handleAvatarRemove = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // バリデーション
    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("パスワードが一致しません");
        return;
      }
      
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
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        // アカウント登録
        const user = await auth.signUpWithEmail(email, password);
        
        // 登録されたユーザーが存在することを確認
        if (!user) {
          throw new Error("ユーザー登録に失敗しました");
        }
        
        // バックエンドにユーザー情報を作成
        // Firebase Authのトークンがバックエンドで認識されるまで待つ
        console.log("Waiting for token to propagate...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // トークンを強制的に再取得
        console.log("Getting fresh token...");
        const freshToken = await user.getIdToken(true);
        console.log("Fresh token acquired:", freshToken.substring(0, 50) + "...");

        // JWTペイロードをデコードしてデバッグ表示
        try {
          const parts = freshToken.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const debugInfo = {
              aud: payload.aud,
              iss: payload.iss,
              sub: payload.sub,
              iat: new Date(payload.iat * 1000).toISOString(),
              exp: new Date(payload.exp * 1000).toISOString(),
              auth_time: payload.auth_time ? new Date(payload.auth_time * 1000).toISOString() : undefined,
              firebase_project: payload.aud,
            };
            console.log("[TOKEN DEBUG]", debugInfo);
            setTokenDebugInfo(JSON.stringify(debugInfo, null, 2));
          }
        } catch (decodeErr) {
          console.error("Token decode error:", decodeErr);
        }

        try {
          const result = await createMe({
            name: name.trim(),
            age: Number(age),
            gender,
            weight: Number(weight),
            chronotype,
            avatar: avatar || undefined,
          });
          
          if (result.ok) {
            setSuccess("アカウント登録が完了しました！バックエンドにもユーザー情報が作成されました。");
          } else {
            const errorMsg = result.error.error || "不明なエラー";
            setError(`アカウント登録は完了しましたが、バックエンド連携に失敗: ${errorMsg}`);
            console.error("Backend API Error:", result.error);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "不明なエラー";
          setError(`アカウント登録は完了しましたが、バックエンド連携に失敗: ${errorMsg}`);
          console.error("Backend API Exception:", err);
        }
      } else {
        // サインイン
        await auth.signInWithEmail(email, password);
        setSuccess("サインインしました！");
      }

      // フォームをリセット
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setAge("");
      setGender("male");
      setWeight("");
      setChronotype("both");
      setAvatar(null);
      setAvatarPreview(null);
    } catch (err) {
      // Firebase エラーメッセージを日本語化
      const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      if (errorMessage.includes("email-already-in-use")) {
        setError("このメールアドレスは既に使用されています");
      } else if (errorMessage.includes("invalid-email")) {
        setError("メールアドレスの形式が正しくありません");
      } else if (errorMessage.includes("weak-password")) {
        setError("パスワードが弱すぎます（6文字以上必要）");
      } else if (errorMessage.includes("user-not-found")) {
        setError("ユーザーが見つかりません");
      } else if (errorMessage.includes("wrong-password")) {
        setError("パスワードが間違っています");
      } else if (errorMessage.includes("too-many-requests")) {
        setError("リクエストが多すぎます。しばらく待ってから再試行してください");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-zinc-600 dark:text-zinc-400">読み込み中...</div>
      </div>
    );
  }

  // ログイン済みの場合
  if (auth.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ログイン中
            </h2>
          </div>

          <div className="space-y-4">
            {/* バックエンド連携のエラー・成功メッセージ */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}
            {loading && (
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-sm text-blue-600 dark:text-blue-400">バックエンドにユーザー情報を登録中...</p>
              </div>
            )}
            {tokenDebugInfo && (
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Token Debug (JWT payload)</p>
                <pre className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-all">{tokenDebugInfo}</pre>
              </div>
            )}

            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                ユーザーID
              </p>
              <p className="break-all text-sm text-zinc-900 dark:text-zinc-100">
                {auth.user.uid}
              </p>
            </div>

            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                メールアドレス
              </p>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {auth.user.email}
              </p>
            </div>

            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                ID Token（先頭50文字）
              </p>
              <code className="block break-all text-xs text-zinc-600 dark:text-zinc-400">
                {auth.idToken?.slice(0, 50)}...
              </code>
            </div>

            <div className="flex gap-3">
              <button
                onClick={auth.refreshToken}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                トークン更新
              </button>
              <button
                onClick={auth.signOut}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                サインアウト
              </button>
            </div>

            <a
              href="/debug"
              className="mt-4 block text-center text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              デバッグコンソールに戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 未ログインの場合：認証フォーム
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Firebase Auth
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            アカウント認証のテスト画面
          </p>
        </div>

        {/* 認証カード */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          {/* モード切り替えタブ */}
          <div className="mb-6 flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                mode === "signin"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              サインイン
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              新規登録
            </button>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* メールアドレス */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                required
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
              />
              {/* パスワード強度インジケーター */}
              {mode === "signup" && passwordStrength && (
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

            {/* パスワード確認（新規登録時のみ） */}
            {mode === "signup" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    パスワード（確認）
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="もう一度入力してください"
                    required
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
                  />
                </div>

                {/* プロフィール写真 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    プロフィール写真（任意）
                  </label>
                  
                  {avatarPreview ? (
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-zinc-300 dark:border-zinc-600">
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
                        className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        削除
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800">
                        <svg
                          className="h-8 w-8 text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <label className="cursor-pointer rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
                        写真を選択
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    JPG、PNG、GIF（最大5MB）
                  </p>
                </div>

                {/* 名前 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    名前
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="山田太郎"
                    required
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
                  />
                </div>

                {/* 年齢 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
                  />
                </div>

                {/* 性別 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    性別
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
                  >
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                {/* 体重 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
                  />
                </div>

                {/* 朝型夜型 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    朝型・夜型
                  </label>
                  <select
                    value={chronotype}
                    onChange={(e) => setChronotype(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
                  >
                    <option value="morning">朝型</option>
                    <option value="night">夜型</option>
                    <option value="both">どちらでも</option>
                  </select>
                </div>
              </>
            )}

            {/* エラーメッセージ */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* 成功メッセージ */}
            {success && (
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <p className="text-sm text-green-600 dark:text-green-400">
                  {success}
                </p>
              </div>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "処理中..."
                : mode === "signup"
                  ? "アカウント登録"
                  : "サインイン"}
            </button>
          </form>

          {/* フッター */}
          <div className="mt-6 text-center">
            <a
              href="/debug"
              className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              デバッグコンソールに戻る
            </a>
          </div>
        </div>

        {/* 補足情報 */}
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            💡 テスト用の情報
          </h3>
          <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
            <li>• パスワードは6文字以上で設定してください</li>
            <li>• 新規登録時は自動的にバックエンドAPIにもユーザーが作成されます</li>
            <li>• ID Tokenは自動的に取得され、APIリクエストに使用されます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
