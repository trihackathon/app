### 目的
TRI-KNOTのバックエンドAPI（Go実装）の各エンドポイントを、Next.jsアプリのデバッグページから実際に叩いて動作確認できるように機能を拡張してください。

### 参照ファイル
- バックエンド仕様: `trihackathon/api/api-81a02589cb1c6a900b94e2cef4e85029835e05a8/documents/API_SPECIFICATION.md`
- バックエンドコントローラー: `user_controller.go`, `team_controller.go`, `goal_controller.go`
- フロントエンドデバッグページ: `trihackathon/app/app-538892880860c75188867993937d059f13ccfcf9/app/debug/` 周辺

### 実施事項

1. **APIクライアントの整備**
   - `lib/api/endpoints.ts` に、API仕様書に基づいたエンドポイントのパス定義を追加してください（User, Team, Goal, Activity, etc.）。
   - `types/api.ts` に、バックエンドの `response` / `requests` 構造体と一致するTypeScriptの型定義を追加してください。

2. **デバッグコンポーネントの機能追加**
   - `app/debug/components/api-tester.tsx`（または新規作成）にて、以下の各APIを個別に実行できるUIを構築してください。
     - **User API**: `GET /api/users/me`, `POST /api/users/me`（名前、年齢、性別等の入力）、`PUT /api/users/me`
     - **Team API**: `POST /api/teams`（チーム作成）、`GET /api/teams/me`
     - **Goal API**: `POST /api/teams/{teamId}/goal`（リーダー権限が必要な点に注意）
   - 各リクエスト実行時に、Firebase AuthのIDトークン（`useAuth`から取得可能）が `Authorization: Bearer <token>` ヘッダーに含まれるようにしてください。

3. **フォームの実装**
   - `UserController.CreateMe` などで `multipart/form-data`（画像アップロード）が必要な箇所は、簡易的なファイル選択フォームを含めてください。
   - チーム作成や目標設定のためのテキスト・数値入力フィールドを設けてください。

4. **レスポンス表示**
   - APIからのレスポンス（成功・エラー共に）を `json-display.tsx` を使って整形表示し、デバッグが容易になるようにしてください。

### 制約
- 既存の `useAuth` フックによる認証フローを壊さないこと。
- APIサーバーのベースURLは環境変数または `lib/api/client.ts` で設定可能にすること。