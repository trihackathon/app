# TRI-KNOT UIデザインガイド

このドキュメントは、TRI-KNOTアプリケーションの統一されたUI/UX設計のためのガイドラインです。

## 🎯 デザインコンセプト

### コアメッセージ
**「仲間を裏切れないから、続く。」**

### デザイン原則

1. **力強さ (Power)**
   - 黒をベースにした重厚感のあるデザイン
   - 太めのフォントウェイトを使用
   - はっきりとしたコントラスト

2. **緊張感 (Tension)**
   - 赤のアクセントで責任感を演出
   - HPゲージなど、リスクを視覚化
   - 「縄が切れる」というメタファーの活用

3. **シンプルさ (Simplicity)**
   - 必要最小限の要素
   - 明確な階層構造
   - 迷わないUI設計

4. **信頼性 (Trust)**
   - GPS自動検証の透明性
   - 数字とデータで証明
   - ごまかせないシステム

## 🎨 カラーパレット

### ブランドカラー

```
Black (メインカラー)
- Primary: #18181b (zinc-900)
- 用途: 背景、テキスト、重要な要素

Red (アクセントカラー)
- Dark: #7f1d1d (red-900) - グラデーション用
- Primary: #dc2626 (red-600) - ボタン、リンク、警告
- Bright: #b91c1c (red-700) - ホバー、フォーカス

White/Gray (サポートカラー)
- White: #ffffff - 背景（ライトモード）
- Zinc-50: #fafafa - 入力フィールド背景
- Zinc-300: #d4d4d8 - ボーダー
- Zinc-600: #52525b - セカンダリテキスト
- Zinc-700: #3f3f46 - ダークモードボーダー
```

### カラー使用ルール

| 要素 | カラー | 理由 |
|------|--------|------|
| 主背景 | Black/White | コントラストを確保 |
| CTA ボタン | Red Gradient | アクションを促す |
| 警告・HP低下 | Red | 危機感を演出 |
| 成功・達成 | Green (補助) | ポジティブなフィードバック |
| リンク | Red | ブランドカラーで統一 |

## ✍️ タイポグラフィ

### フォント階層

```typescript
// ヘッドライン
h1: text-5xl font-bold (48px)
h2: text-3xl font-bold (30px)
h3: text-2xl font-bold (24px)
h4: text-xl font-semibold (20px)

// ボディ
body-large: text-lg (18px)
body: text-base (16px)
body-small: text-sm (14px)
caption: text-xs (12px)

// 特殊
display: text-6xl font-bold (60px) - ヒーローセクション
number: text-7xl font-bold (72px) - 大きな数字表示
```

### フォントウェイト

- **Bold (700)**: ヘッドライン、CTA
- **Semibold (600)**: サブヘッド、重要な情報
- **Medium (500)**: ナビゲーション、ラベル
- **Regular (400)**: 本文

### 文字間隔・行間

```css
letter-spacing:
  - tight: -0.05em (大きなヘッドライン)
  - normal: 0 (通常のテキスト)
  - wide: 0.05em (小さなキャプション)

line-height:
  - tight: 1.2 (ヘッドライン)
  - normal: 1.5 (本文)
  - relaxed: 1.75 (長文)
```

## 🧩 コンポーネント設計

### 1. ボタン

#### プライマリボタン
```tsx
// 用途: メインアクション（ログイン、登録、開始など）
<button className="
  rounded-lg
  bg-gradient-to-r from-zinc-900 via-red-600 to-red-700
  px-6 py-3
  text-base font-medium text-white
  transition-all
  hover:opacity-90
  active:scale-95
  disabled:opacity-50 disabled:cursor-not-allowed
">
  アクションテキスト
</button>
```

#### セカンダリボタン
```tsx
// 用途: キャンセル、戻る、サブアクション
<button className="
  rounded-lg
  border-2 border-zinc-300 dark:border-zinc-600
  bg-transparent
  px-6 py-3
  text-base font-medium text-zinc-900 dark:text-white
  transition-all
  hover:bg-zinc-50 dark:hover:bg-zinc-800
  active:scale-95
">
  キャンセル
</button>
```

#### テキストボタン/リンク
```tsx
// 用途: ナビゲーション、補助的なアクション
<button className="
  text-red-600 dark:text-red-400
  font-medium
  hover:underline
  transition-colors
">
  詳しく見る
</button>
```

### 2. 入力フィールド

```tsx
// テキスト入力
<input className="
  w-full
  rounded-lg
  border border-zinc-300 dark:border-zinc-700
  bg-white dark:bg-zinc-900
  px-4 py-3
  text-base text-zinc-900 dark:text-white
  transition-colors
  focus:border-red-500 dark:focus:border-red-400
  focus:outline-none
  focus:ring-2 focus:ring-red-500/20
  placeholder:text-zinc-400
" />

// ラベル付き
<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
  ラベルテキスト
</label>
```

### 3. カード

```tsx
// 基本カード
<div className="
  rounded-2xl
  border border-zinc-200 dark:border-zinc-800
  bg-white dark:bg-zinc-900
  p-6
  shadow-lg
  transition-all
  hover:shadow-xl
">
  コンテンツ
</div>

// インタラクティブカード
<div className="
  rounded-2xl
  border border-zinc-200 dark:border-zinc-800
  bg-white dark:bg-zinc-900
  p-6
  shadow-lg
  transition-all
  hover:shadow-xl hover:scale-105
  cursor-pointer
  active:scale-100
">
  クリッカブルなコンテンツ
</div>
```

### 4. ステップインジケーター

```tsx
// 数字付きステップ（TRI-KNOTスタイル）
<div className="flex items-start gap-4">
  <div className="
    flex h-12 w-12 shrink-0 items-center justify-center
    rounded-full
    bg-gradient-to-br from-zinc-900 to-red-900
    text-xl font-bold text-white
  ">
    01
  </div>
  <div>
    <h3 className="text-xl font-bold">ステップタイトル</h3>
    <p className="text-zinc-600">説明文</p>
  </div>
</div>

// ドット式インジケーター
<div className="flex gap-2">
  {/* アクティブ */}
  <div className="h-2 w-8 rounded-full bg-red-600 transition-all" />
  {/* 非アクティブ */}
  <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700 transition-all" />
</div>
```

### 5. HPゲージ（進捗表示）

```tsx
// HPバー
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
      HP
    </span>
    <span className="text-sm font-bold text-zinc-900 dark:text-white">
      65 / 100
    </span>
  </div>
  <div className="h-4 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
      style={{ width: '65%' }}
    />
  </div>
  <p className="text-xs text-zinc-500 dark:text-zinc-400">
    ほつれ始め
  </p>
</div>

// HPレベル表示（TRI-KNOTスタイル）
<div className="space-y-4">
  {[
    { hp: 100, status: '強固な結束', color: 'green' },
    { hp: 65, status: 'ほつれ始め', color: 'yellow' },
    { hp: 30, status: '大きく損傷', color: 'orange' },
    { hp: 5, status: '崩壊寸前', color: 'red' },
  ].map(item => (
    <div key={item.hp} className="flex items-center gap-4">
      <span className="text-2xl font-bold text-zinc-900 dark:text-white w-16">
        HP {item.hp}
      </span>
      <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className={`h-full w-full rounded-full bg-${item.color}-500`} />
      </div>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {item.status}
      </span>
    </div>
  ))}
</div>
```

### 6. アラート・通知

```tsx
// エラー
<div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
    エラーメッセージ
  </p>
</div>

// 成功
<div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
    成功メッセージ
  </p>
</div>

// 警告
<div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
    警告メッセージ
  </p>
</div>

// 情報
<div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
    情報メッセージ
  </p>
</div>
```

## 📱 レイアウトパターン

### 1. 認証画面（2カラム）

```
┌─────────────────────────────────────┐
│ [ブランディング]  │  [フォーム]      │
│                  │                  │
│ - ロゴ           │  - ヘッダー      │
│ - キャッチコピー │  - 入力フィールド│
│ - 説明文         │  - ボタン        │
│                  │  - リンク        │
│ - フッター       │                  │
└─────────────────────────────────────┘
  ← 50% →           ← 50% →
  (PC時)            (モバイル: 100%)
```

### 2. ダッシュボード

```
┌─────────────────────────────────────┐
│ [ナビゲーションバー]                │
├─────────────────────────────────────┤
│ [HPゲージ・警告]                    │
├─────────────────────────────────────┤
│ [メインコンテンツ]                  │
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │ カード1 │ │ カード2 │            │
│ └─────────┘ └─────────┘            │
│                                     │
│ [アクションエリア]                  │
└─────────────────────────────────────┘
```

### 3. ランディングページ

```
┌─────────────────────────────────────┐
│ [ヘッダー]                          │
│ ロゴ              [ナビ] [CTA]      │
├─────────────────────────────────────┤
│ [ヒーローセクション]                │
│        大きなキャッチコピー         │
│        サブテキスト                 │
│        [CTAボタン]                  │
├─────────────────────────────────────┤
│ [仕組みセクション]                  │
│                                     │
│ 01 → 02 → 03                        │
│ [ステップ1] [ステップ2] [ステップ3]│
├─────────────────────────────────────┤
│ [HPシステム説明]                    │
│                                     │
│ HP 100 ━━━━━━━━ 強固な結束         │
│ HP 65  ━━━━━    ほつれ始め         │
│ HP 30  ━━       大きく損傷          │
│ HP 5   ━        崩壊寸前            │
├─────────────────────────────────────┤
│ [CTA セクション]                    │
│        今日から始める               │
│        [大きなCTAボタン]            │
├─────────────────────────────────────┤
│ [フッター]                          │
└─────────────────────────────────────┘
```

## 🎭 画面別デザイン仕様

### ランディングページ (`/`)

**目的**: ユーザーを引きつけ、アプリのコンセプトを理解させる

**セクション構成**:
1. ヒーローセクション
   - キャッチコピー: 「仲間を裏切れないから、続く。」（text-5xl font-bold）
   - サブテキスト: 「3人1組の連帯責任で、三日坊主を打ち破る。」
   - CTAボタン: 「デモを体験する」「もっと知る」

2. 仕組みセクション
   - 3つのステップを数字（01, 02, 03）で表示
   - 各ステップにアイコン + タイトル + 説明文
   - ステップ1: 3人で結ぶ
   - ステップ2: GPSが証明する
   - ステップ3: 裏切ればHPが減る

3. HPシステム可視化
   - 「縄が切れたら、終わり。」
   - 4段階のHP表示とその状態
   - 縄のほつれを視覚化（アニメーション）

4. CTAセクション
   - 「今日から始める」
   - 大きなCTAボタン

### ログイン画面 (`/auth/login`)

**レイアウト**: 2カラム（左: ブランディング、右: フォーム）

**左側（ブランディング）**:
- グラデーション背景: `from-zinc-900 via-red-900 to-black`
- TKロゴ（上部）
- キャッチコピー（中央）
- コピーライト（下部）

**右側（フォーム）**:
- ヘッダー: "ログイン"
- Google認証ボタン
- 区切り線: "または"
- メールアドレス入力
- パスワード入力
- ログインボタン
- 新規登録リンク

### 新規登録画面 (`/auth/signup`)

**レイアウト**: 2カラム + 2ステップ

**Step 1: 認証情報**
- Google認証ボタン
- メールアドレス
- パスワード（強度インジケーター付き）
- パスワード確認

**Step 2: プロフィール**
- プロフィール写真（円形、中央配置）
- 名前
- 年齢、体重（2カラム）
- 性別、朝型/夜型（ドロップダウン）

### ダッシュボード (`/dashboard`)

**上部エリア**:
- ユーザー情報
- チーム名
- HPゲージ（大きく表示）

**メインエリア**:
- 今週の進捗カード
- チームメンバーのステータス
- 次のタスク/目標

**アクションエリア**:
- 運動を記録するボタン（目立つCTA）

### チーム作成/参加画面

**チーム作成**:
- チーム名入力
- 運動タイプ選択（ランニング/ジム）
- 厳しさレベル選択
- 目標設定（距離/回数/時間）
- 作成ボタン

**チーム参加**:
- 招待コード入力
- チーム情報プレビュー
- 参加ボタン

### 運動記録画面

**ランニング**:
- GPS地図表示（大きく）
- 現在の距離/時間
- スタート/停止ボタン（大きなFAB）
- GPSポイントのリスト

**ジム**:
- チェックイン/チェックアウト
- 滞在時間表示
- ジムロケーション選択

## 🎬 アニメーション・インタラクション

### トランジション

```css
/* 標準トランジション */
transition-all duration-200 ease-in-out

/* ホバー効果 */
hover:scale-105 transition-transform
hover:opacity-90 transition-opacity

/* ボタンクリック */
active:scale-95 transition-transform

/* ページ遷移 */
fade-in: opacity-0 → opacity-100 (300ms)
slide-up: translate-y-8 → translate-y-0 (300ms)
```

### マイクロインタラクション

1. **ボタンホバー**: スケール105%、不透明度90%
2. **ボタンクリック**: スケール95%（押し込み効果）
3. **フォーカス**: リング表示（ring-2 ring-red-500/20）
4. **ローディング**: スピナーまたはパルスアニメーション
5. **成功**: チェックマークアニメーション
6. **エラーシェイク**: 横に小刻みに揺れる

### HPゲージアニメーション

```tsx
// スムーズな減少アニメーション
<div 
  className="transition-all duration-500 ease-out"
  style={{ width: `${hp}%` }}
/>

// パルス効果（低HP時）
<div className={hp < 30 ? 'animate-pulse' : ''}>
```

## 📐 スペーシング

### パディング/マージン

```
xs: 0.5rem (8px)
sm: 0.75rem (12px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
3xl: 4rem (64px)
```

### コンポーネント間隔

```
カード内パディング: p-6 (24px)
セクション間マージン: space-y-8 (32px)
フォーム要素間: space-y-4 (16px)
ボタン間: gap-3 (12px)
```

## 🌓 ダークモード

### 切り替えルール

- `prefers-color-scheme`に基づいて自動切り替え
- ユーザー設定で上書き可能

### カラー対応表

| 要素 | ライト | ダーク |
|------|--------|--------|
| 背景 | white | zinc-950 |
| テキスト | zinc-900 | white |
| ボーダー | zinc-300 | zinc-700 |
| 入力フィールド背景 | white | zinc-900 |
| カード背景 | white | zinc-900 |
| ホバー背景 | zinc-50 | zinc-800 |

## 📱 レスポンシブ

### ブレークポイント

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### レイアウト調整

**2カラム → 1カラム**:
```tsx
<div className="flex flex-col lg:flex-row">
  <div className="w-full lg:w-1/2">左側</div>
  <div className="w-full lg:w-1/2">右側</div>
</div>
```

**フォントサイズ調整**:
```tsx
<h1 className="text-3xl md:text-4xl lg:text-5xl">
  レスポンシブヘッドライン
</h1>
```

**パディング調整**:
```tsx
<div className="p-4 md:p-6 lg:p-8">
  コンテンツ
</div>
```

## ♿ アクセシビリティ

### 必須要素

1. **適切なコントラスト比**: 最低4.5:1
2. **フォーカス可視化**: `focus:ring-2 focus:ring-red-500/20`
3. **キーボードナビゲーション**: すべてのインタラクティブ要素
4. **セマンティックHTML**: `<button>`, `<nav>`, `<main>`など
5. **ARIAラベル**: 必要に応じて`aria-label`を追加

### 実装例

```tsx
// ボタン
<button
  aria-label="ログイン"
  disabled={loading}
  aria-disabled={loading}
>
  {loading ? 'ローディング中...' : 'ログイン'}
</button>

// リンク
<Link href="/signup" aria-label="新規登録ページへ移動">
  新規登録
</Link>

// 入力フィールド
<label htmlFor="email">メールアドレス</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={error ? 'true' : 'false'}
/>
```

## 🛠️ 実装のベストプラクティス

### 1. コンポーネント再利用

```tsx
// ❌ 悪い例: ハードコーディング
<button className="rounded-lg bg-gradient-to-r from-zinc-900 via-red-600 to-red-700 px-6 py-3">
  ボタン
</button>

// ✅ 良い例: 定数を使用
import { GRADIENTS } from '@/lib/constants/colors';

<button className={`rounded-lg ${GRADIENTS.BUTTON} px-6 py-3`}>
  ボタン
</button>
```

### 2. レイアウトコンポーネント

```tsx
// PageContainer.tsx
export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {children}
    </div>
  );
}

// Section.tsx
export function Section({ children, className }: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-12 md:py-16 lg:py-24 ${className}`}>
      {children}
    </section>
  );
}
```

### 3. 条件付きスタイル

```tsx
// clsx または cn ユーティリティを使用
import { clsx } from 'clsx';

<button className={clsx(
  'px-6 py-3 rounded-lg',
  isPrimary ? GRADIENTS.BUTTON : 'border border-zinc-300',
  isLoading && 'opacity-50 cursor-not-allowed'
)}>
  ボタン
</button>
```

## 📋 チェックリスト

新しい画面を作成する際のチェックリスト：

- [ ] カラー定数を使用している
- [ ] レスポンシブデザインに対応している
- [ ] ダークモードに対応している
- [ ] アクセシビリティ要件を満たしている
- [ ] ローディング状態を実装している
- [ ] エラー状態を実装している
- [ ] 適切なアニメーションを追加している
- [ ] キーボードナビゲーションが機能する
- [ ] フォーカス状態が視覚化されている
- [ ] コンポーネントが再利用可能である

## 🎯 プロンプト例

新しい画面をAIに作成してもらう際のプロンプト例：

```
TRI-KNOTのUIデザインガイド（documents/ui-design-guide.md）に従って、
[画面名]を作成してください。

要件:
- カラー定数（lib/constants/colors.ts）を使用
- レスポンシブデザイン対応
- ダークモード対応
- [具体的な機能要件]

デザインのポイント:
- 黒と赤のブランドカラーを使用
- 力強く、シンプルなデザイン
- [追加のデザイン要件]
```

## 📚 参考リソース

- [TRI-KNOT 参考サイト](https://v0-team-accountability-platform.vercel.app/)
- [カラーシステム](./color-system.md)
- [API アーキテクチャ](./api-architecture.md)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
