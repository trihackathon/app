/**
 * アプリケーション全体で使用するブランドカラー定数
 * 
 * 黒と赤のテーマカラーを中心とした配色
 * - 黒: 重厚感、信頼性、力強さを表現
 * - 赤: 情熱、緊張感、コミットメントを表現
 */

export const BRAND_COLORS = {
  // メインカラー
  BLACK: 'brand-black', // zinc-900相当
  RED_DARK: 'brand-red-dark', // red-900相当
  RED: 'brand-red', // red-600相当
  RED_BRIGHT: 'brand-red-bright', // red-700相当
} as const;

/**
 * グラデーション用のクラス名を生成
 */
export const GRADIENTS = {
  // 背景用グラデーション（黒 → 赤 → 黒）
  BACKGROUND: 'bg-gradient-to-br from-zinc-900 via-red-900 to-black',
  
  // ボタン用グラデーション（黒 → 赤）
  BUTTON: 'bg-gradient-to-r from-zinc-900 via-red-600 to-red-700',
} as const;

/**
 * フォーカス時のスタイル
 */
export const FOCUS_STYLES = {
  // 入力フィールド用
  INPUT: 'focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:focus:border-red-400',
  
  // ホバー時
  HOVER_BORDER: 'hover:border-red-500',
} as const;

/**
 * リンク用のスタイル
 */
export const LINK_STYLES = {
  PRIMARY: 'text-red-600 hover:underline dark:text-red-400',
} as const;

/**
 * ステップインジケーター用
 */
export const INDICATOR_STYLES = {
  ACTIVE: 'bg-red-600',
  INACTIVE: 'bg-zinc-300 dark:bg-zinc-700',
} as const;
