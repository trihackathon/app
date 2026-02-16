# カラーシステム

このドキュメントでは、アプリケーション全体で使用するカラーシステムの管理方法を説明します。

## 概要

TRI-KNOTアプリケーションでは、**黒と赤**をテーマカラーとして採用しています。

- **黒**: 重厚感、信頼性、力強さを表現
- **赤**: 情熱、緊張感、コミットメント、「裏切れない」という責任感を表現

## カラーの定義場所

### 1. CSS変数（`app/globals.css`）

Tailwind CSS v4の機能を使用して、CSS変数でブランドカラーを定義しています。

```css
:root {
  /* Brand Colors - 黒と赤のテーマカラー */
  --brand-black: #18181b; /* zinc-900 */
  --brand-red-dark: #7f1d1d; /* red-900 */
  --brand-red: #dc2626; /* red-600 */
  --brand-red-bright: #b91c1c; /* red-700 */
}

@theme inline {
  /* Brand Colors */
  --color-brand-black: var(--brand-black);
  --color-brand-red-dark: var(--brand-red-dark);
  --color-brand-red: var(--brand-red);
  --color-brand-red-bright: var(--brand-red-bright);
}
```

### 2. TypeScript定数（`lib/constants/colors.ts`）

再利用可能なスタイルクラスをTypeScript定数として定義しています。

```typescript
export const GRADIENTS = {
  // 背景用グラデーション
  BACKGROUND: 'bg-gradient-to-br from-zinc-900 via-red-900 to-black',
  
  // ボタン用グラデーション
  BUTTON: 'bg-gradient-to-r from-zinc-900 via-red-600 to-red-700',
};

export const FOCUS_STYLES = {
  // 入力フィールド用
  INPUT: 'focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:focus:border-red-400',
  
  // ホバー時
  HOVER_BORDER: 'hover:border-red-500',
};
```

## 使用方法

### グラデーション背景

```tsx
import { GRADIENTS } from '@/lib/constants/colors';

<div className={`${GRADIENTS.BACKGROUND} p-12`}>
  コンテンツ
</div>
```

### ボタンスタイル

```tsx
import { GRADIENTS } from '@/lib/constants/colors';

<button className={`${GRADIENTS.BUTTON} px-4 py-3`}>
  ボタン
</button>
```

### 入力フィールド

```tsx
import { FOCUS_STYLES } from '@/lib/constants/colors';

<input
  className={`border px-4 py-3 ${FOCUS_STYLES.INPUT}`}
  type="text"
/>
```

### リンク

```tsx
import { LINK_STYLES } from '@/lib/constants/colors';

<Link href="/path" className={LINK_STYLES.PRIMARY}>
  リンクテキスト
</Link>
```

## カラーパレット

| 色名 | 用途 | Tailwind | Hex |
|------|------|----------|-----|
| Brand Black | メインカラー、背景 | zinc-900 | #18181b |
| Brand Red Dark | グラデーション | red-900 | #7f1d1d |
| Brand Red | アクセント、ボタン | red-600 | #dc2626 |
| Brand Red Bright | ホバー、フォーカス | red-700 | #b91c1c |

## 定数一覧

### `GRADIENTS`

| 定数名 | 説明 | クラス名 |
|--------|------|----------|
| `BACKGROUND` | 背景用グラデーション | `bg-gradient-to-br from-zinc-900 via-red-900 to-black` |
| `BUTTON` | ボタン用グラデーション | `bg-gradient-to-r from-zinc-900 via-red-600 to-red-700` |

### `FOCUS_STYLES`

| 定数名 | 説明 | クラス名 |
|--------|------|----------|
| `INPUT` | 入力フィールドのフォーカス | `focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:focus:border-red-400` |
| `HOVER_BORDER` | ホバー時のボーダー | `hover:border-red-500` |

### `LINK_STYLES`

| 定数名 | 説明 | クラス名 |
|--------|------|----------|
| `PRIMARY` | プライマリリンク | `text-red-600 hover:underline dark:text-red-400` |

### `INDICATOR_STYLES`

| 定数名 | 説明 | クラス名 |
|--------|------|----------|
| `ACTIVE` | アクティブインジケーター | `bg-red-600` |
| `INACTIVE` | 非アクティブインジケーター | `bg-zinc-300 dark:bg-zinc-700` |

## カラー変更時の手順

カラーを変更する場合は、以下の手順で行います：

### 1. CSS変数を更新

`app/globals.css`の`:root`セクションで色の値を変更：

```css
:root {
  --brand-red: #新しい色コード;
}
```

### 2. 定数を更新（必要に応じて）

`lib/constants/colors.ts`でクラス名を更新：

```typescript
export const GRADIENTS = {
  BUTTON: 'bg-gradient-to-r from-新しい色 via-新しい色 to-新しい色',
};
```

### 3. 動作確認

- ログイン画面: `/auth/login`
- 新規登録画面: `/auth/signup`

## ベストプラクティス

### ✅ 推奨

- 定数ファイル（`colors.ts`）からインポートして使用
- 一貫性のあるスタイルを保つため、直接色を指定しない
- 新しいスタイルが必要な場合は、`colors.ts`に追加してから使用

```tsx
// Good ✅
import { GRADIENTS } from '@/lib/constants/colors';
<button className={GRADIENTS.BUTTON}>ボタン</button>
```

### ❌ 非推奨

- ハードコーディングされた色クラスを直接使用
- 同じスタイルの重複定義

```tsx
// Bad ❌
<button className="bg-gradient-to-r from-zinc-900 via-red-600 to-red-700">
  ボタン
</button>
```

## ダークモード対応

すべてのスタイルはダークモード対応済みです。Tailwindの`dark:`プレフィックスを使用しています。

```tsx
// 自動的にダークモードに対応
<input className={FOCUS_STYLES.INPUT} />
// ダークモードでは dark:focus:border-red-400 が適用される
```

## 参考リンク

- [Tailwind CSS v4 - Theme Configuration](https://tailwindcss.com/docs/theme)
- [CSS Custom Properties](https://developer.mozilla.org/ja/docs/Web/CSS/--*)
