"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, LogOut, AlertTriangle, Trash2, MapPin, Plus, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useDashboard } from "@/components/dashboard-context"
import { useAuth } from "@/hooks/use-auth"
import { updateMe, getDisbandVotes, voteDisband, cancelDisbandVote, getGymLocations, createGymLocation, deleteGymLocation } from "@/lib/api/endpoints"
import type { DisbandVoteResponse, GymLocationResponse } from "@/types/api"
import { MemberAvatar } from "@/components/member-avatar"
import { Spinner } from "@/components/ui/spinner"

export default function SettingsPage() {
  const router = useRouter()
  const { user, team, refreshUser, refreshTeam } = useDashboard()
  const { signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [disbandVotes, setDisbandVotes] = useState<DisbandVoteResponse | null>(null)
  const [disbandLoading, setDisbandLoading] = useState(false)
  const [disbandConfirmOpen, setDisbandConfirmOpen] = useState(false)

  const hasVoted = disbandVotes?.voted_users?.includes(user?.id ?? "") ?? false

  // Gym management state
  const isGymTeam = team?.exercise_type === "gym"
  const [gymLocations, setGymLocations] = useState<GymLocationResponse[]>([])
  const [gymName, setGymName] = useState("")
  const [gymLat, setGymLat] = useState("")
  const [gymLng, setGymLng] = useState("")
  const [gymRadius, setGymRadius] = useState("100")
  const [gymLoading, setGymLoading] = useState(false)
  const [gymGpsLoading, setGymGpsLoading] = useState(false)
  const [gymError, setGymError] = useState<string | null>(null)

  useEffect(() => {
    if (isGymTeam) {
      getGymLocations().then((result) => {
        if (result.ok) setGymLocations(result.data)
      })
    }
  }, [isGymTeam])

  const handleGetGPS = async () => {
    setGymGpsLoading(true)
    setGymError(null)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      )
      setGymLat(String(pos.coords.latitude))
      setGymLng(String(pos.coords.longitude))
    } catch {
      setGymError("位置情報の取得に失敗しました")
    } finally {
      setGymGpsLoading(false)
    }
  }

  const handleAddGym = async () => {
    if (!gymName.trim()) { setGymError("名前を入力してください"); return }
    if (!gymLat || !gymLng) { setGymError("位置情報を取得してください"); return }
    setGymLoading(true)
    setGymError(null)
    try {
      const result = await createGymLocation({
        name: gymName.trim(),
        latitude: Number(gymLat),
        longitude: Number(gymLng),
        radius_m: Number(gymRadius) || 100,
      })
      if (result.ok) {
        setGymLocations((prev) => [...prev, result.data])
        setGymName("")
        setGymLat("")
        setGymLng("")
        setGymRadius("100")
      } else {
        setGymError("ジムの追加に失敗しました")
      }
    } catch {
      setGymError("ジムの追加に失敗しました")
    } finally {
      setGymLoading(false)
    }
  }

  const handleDeleteGym = async (id: string) => {
    const result = await deleteGymLocation(id)
    if (result.ok) {
      setGymLocations((prev) => prev.filter((g) => g.id !== id))
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (team?.id && (team.status === "active" || team.status === "forming")) {
      getDisbandVotes(team.id).then((result) => {
        if (result.ok) setDisbandVotes(result.data)
      })
    }
  }, [team?.id, team?.status])

  const handleVoteDisband = async () => {
    if (!team?.id) return
    setDisbandLoading(true)
    try {
      const result = await voteDisband(team.id)
      if (result.ok) {
        setDisbandVotes(result.data)
        if (result.data.disbanded) {
          await refreshTeam()
          router.push("/funeral")
        }
      }
    } finally {
      setDisbandLoading(false)
      setDisbandConfirmOpen(false)
    }
  }

  const handleCancelVote = async () => {
    if (!team?.id) return
    setDisbandLoading(true)
    try {
      const result = await cancelDisbandVote(team.id)
      if (result.ok) {
        setDisbandVotes(result.data)
      }
    } finally {
      setDisbandLoading(false)
    }
  }

  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("male")
  const [weight, setWeight] = useState("")
  const [chronotype, setChronotype] = useState("both")
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setAge(String(user.age))
      setGender(user.gender)
      setWeight(String(user.weight))
      setChronotype(user.chronotype)
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url)
      }
    }
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("画像サイズは5MB以下にしてください")
        return
      }
      if (!file.type.startsWith("image/")) {
        setError("画像ファイルを選択してください")
        return
      }
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarRemove = () => {
    setAvatar(null)
    setAvatarPreview(user?.avatar_url || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!name.trim()) {
      setError("名前を入力してください")
      return
    }
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) {
      setError("年齢を正しく入力してください")
      return
    }
    if (!weight.trim() || isNaN(Number(weight)) || Number(weight) <= 0) {
      setError("体重を正しく入力してください")
      return
    }

    setLoading(true)

    try {
      const result = await updateMe({
        name: name.trim(),
        age: Number(age),
        gender,
        weight: Number(weight),
        chronotype,
        avatar: avatar || undefined,
      })

      if (result.ok) {
        await refreshUser()
        setSuccess(true)
        setAvatar(null)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error.error || "更新に失敗しました")
      }
    } catch {
      setError("更新に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const currentAvatarSrc = avatarPreview || user?.avatar_url

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-card transition-colors"
          aria-label="戻る"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-black text-foreground">設定</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-4 rounded-lg bg-accent/10 border border-accent/20 p-3">
          <p className="text-sm text-accent">プロフィールを更新しました</p>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm font-bold text-foreground">プロフィール写真</span>
          {currentAvatarSrc ? (
            <div className="flex flex-col items-center gap-2">
              <MemberAvatar
                src={currentAvatarSrc}
                name={name || "?"}
                className="h-20 w-20 text-2xl"
              />
              <div className="flex gap-2">
                <label className="cursor-pointer text-xs text-primary hover:underline">
                  変更
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    className="text-xs text-destructive hover:underline"
                  >
                    元に戻す
                  </button>
                )}
              </div>
            </div>
          ) : (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border bg-card transition-colors hover:border-primary/50">
              <span className="text-2xl font-bold text-muted-foreground">
                {name.charAt(0) || "?"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田太郎"
            required
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
          />
        </div>

        {/* Age & Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">年齢</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              min="1"
              max="150"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">体重 (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
              min="1"
              max="300"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">性別</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
          >
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        </div>

        {/* Chronotype */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">朝型・夜型</label>
          <select
            value={chronotype}
            onChange={(e) => setChronotype(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
          >
            <option value="morning">朝型</option>
            <option value="night">夜型</option>
            <option value="both">どちらでも</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <><Spinner size="sm" className="border-primary-foreground/30 border-t-primary-foreground" /> 保存中...</> : "保存する"}
        </button>
      </form>

      {/* Gym Management */}
      {isGymTeam && (
        <div className="mt-8 border-t border-border pt-6">
          <h2 className="mb-3 text-sm font-bold text-foreground">ジム管理</h2>

          {gymError && (
            <div className="mb-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{gymError}</p>
            </div>
          )}

          {/* Registered gyms */}
          {gymLocations.length > 0 && (
            <div className="mb-4 flex flex-col gap-2">
              {gymLocations.map((gym) => (
                <div key={gym.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{gym.name}</p>
                    <p className="text-xs text-muted-foreground">半径 {gym.radius_m}m</p>
                  </div>
                  <button
                    onClick={() => handleDeleteGym(gym.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add gym form */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-xs font-bold text-foreground">ジムを追加</p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                placeholder="ジム名"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGetGPS}
                  disabled={gymGpsLoading}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-card disabled:opacity-50"
                >
                  {gymGpsLoading ? <Spinner size="sm" /> : <MapPin className="h-4 w-4" />}
                  現在地を取得
                </button>
                {gymLat && gymLng && (
                  <span className="flex items-center text-xs text-accent">取得済み</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={gymLat}
                  onChange={(e) => setGymLat(e.target.value)}
                  placeholder="緯度"
                  step="any"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                />
                <input
                  type="number"
                  value={gymLng}
                  onChange={(e) => setGymLng(e.target.value)}
                  placeholder="経度"
                  step="any"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">半径 (m)</label>
                <input
                  type="number"
                  value={gymRadius}
                  onChange={(e) => setGymRadius(e.target.value)}
                  placeholder="100"
                  min="10"
                  max="1000"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddGym}
                disabled={gymLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {gymLoading ? <><Spinner size="sm" className="border-primary-foreground/30 border-t-primary-foreground" /> 追加中...</> : <><Plus className="h-4 w-4" /> 追加する</>}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Theme Selection */}
      <div className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-sm font-bold text-foreground">テーマ</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTheme("light")}
              disabled={!mounted}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold transition-colors ${
                mounted && theme === "light"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-card-foreground/5"
              } disabled:opacity-50`}
            >
              <Sun className="h-4 w-4" />
              ライト
            </button>
            <button
              onClick={() => setTheme("dark")}
              disabled={!mounted}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold transition-colors ${
                mounted && theme === "dark"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-card-foreground/5"
              } disabled:opacity-50`}
            >
              <Moon className="h-4 w-4" />
              ダーク
            </button>
          </div>
        </div>
      </div>

      {/* Disband Vote */}
      {team && (team.status === "active" || team.status === "forming") && (
        <div className="mt-8 border-t border-border pt-6">
          <h2 className="mb-3 text-sm font-bold text-foreground">チーム解散</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            {disbandVotes && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">投票状況</span>
                  <span className="font-bold text-foreground">
                    {disbandVotes.voted_count} / {disbandVotes.total_count}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-destructive transition-all"
                    style={{
                      width: `${disbandVotes.total_count > 0 ? (disbandVotes.voted_count / disbandVotes.total_count) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  全員が投票するとチームは解散されます
                </p>
              </div>
            )}

            {hasVoted ? (
              <button
                onClick={handleCancelVote}
                disabled={disbandLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-card disabled:opacity-50"
              >
                {disbandLoading ? (
                  <><Spinner size="sm" /> 処理中...</>
                ) : (
                  "投票を取り消す"
                )}
              </button>
            ) : !disbandConfirmOpen ? (
              <button
                onClick={() => setDisbandConfirmOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 px-4 py-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
              >
                <AlertTriangle className="h-4 w-4" />
                解散に投票する
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-destructive font-bold text-center">
                  本当に解散に投票しますか？
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDisbandConfirmOpen(false)}
                    className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-card"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleVoteDisband}
                    disabled={disbandLoading}
                    className="flex-1 rounded-lg bg-destructive px-4 py-3 text-sm font-bold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {disbandLoading ? "処理中..." : "投票する"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="mt-8 border-t border-border pt-6">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 px-4 py-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </div>
    </div>
  )
}
