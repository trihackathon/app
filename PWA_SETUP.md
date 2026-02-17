# PWA設定ガイド

## 完了した設定

### 1. マニフェストファイル
`public/manifest.json` を作成しました。

- アプリ名: TRI-KNOT
- スタンドアローンモード（アプリのように表示）
- ダークテーマ対応
- ショートカット機能（運動記録、ダッシュボード）

### 2. Next.js統合
`app/layout.tsx` にマニフェストとApple PWA設定を追加しました。

## 必要なアイコンファイル

PWAとして動作するには、以下のアイコンファイルが必要です：

### 必須アイコン
- `public/icon-192x192.png` - 192x192ピクセル
- `public/icon-512x512.png` - 512x512ピクセル

### 推奨アイコン（オプション）
- `public/apple-touch-icon.png` - 180x180ピクセル（iOS用）
- `public/favicon.ico` - 32x32ピクセル

### アイコン作成のヒント
1. **デザイン**: TRI-KNOTのロゴまたはアプリを象徴するアイコン
2. **形式**: PNG形式（透過背景推奨）
3. **セーフエリア**: 四隅から10%程度の余白を確保（マスキング対応）
4. **カラー**: ダークテーマ（#0a0a0b）に合うデザイン

## PWAインストールのテスト

### Chrome DevTools
1. F12で開発者ツールを開く
2. Application タブ > Manifest を確認
3. Service Workers がある場合は確認

### インストール要件
✅ HTTPS環境（または localhost）
✅ マニフェストファイル
✅ 適切なアイコン
⚠️ Service Worker（オフライン対応の場合）

## Service Worker（オプション）

完全なPWA機能（オフライン対応、バックグラウンド同期）が必要な場合：

### next-pwa のインストール
\`\`\`bash
npm install next-pwa
\`\`\`

### next.config.ts の設定
\`\`\`typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // 既存の設定
})
\`\`\`

## 現在の状態

✅ マニフェストファイル作成済み
✅ Next.jsメタデータ設定済み
⚠️ アイコンファイル未作成（192x192, 512x512が必要）
⚠️ Service Worker未実装（オフライン機能が必要な場合）

## 参考資料

- [PWA統合ガイド](../../api/documents/PWA_INTEGRATION.md)
- [Web App Manifest - MDN](https://developer.mozilla.org/ja/docs/Web/Manifest)
- [Progressive Web Apps - web.dev](https://web.dev/explore/progressive-web-apps)
