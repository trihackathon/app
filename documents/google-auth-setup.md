# Google認証の設定手順

このドキュメントでは、Firebase AuthでGoogle認証を有効化する手順を説明します。

## 1. Firebase Consoleでの設定

### 1.1 Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト「trihackathon」を選択

### 1.2 Authentication設定

1. 左サイドバーの「Authentication」をクリック
2. 「Sign-in method」タブをクリック
3. 「新しいプロバイダを追加」ボタンをクリック

### 1.3 Googleプロバイダを有効化

1. プロバイダ一覧から「Google」を選択
2. 「有効にする」トグルをONにする
3. **プロジェクトのサポートメール**を選択（必須）
   - プルダウンから適切なメールアドレスを選択
4. **プロジェクトの公開名**を入力（オプション）
   - 例: "TRI-KNOT"
5. 「保存」ボタンをクリック

## 2. 承認済みドメインの設定

Google認証を使用するドメインを承認する必要があります。

### 2.1 本番環境のドメイン追加

1. Firebase Console > Authentication > Settings タブ
2. 「承認済みドメイン」セクションを確認
3. 本番環境のドメインを追加
   - 例: `v0-team-accountability-platform.vercel.app`
   - 「ドメインを追加」ボタンから追加

### 2.2 デフォルトで承認されているドメイン

以下のドメインはデフォルトで承認されています：
- `localhost`（開発環境用）
- `*.firebaseapp.com`（Firebase Hosting用）

## 3. Google Cloud Consoleでの追加設定（必要に応じて）

より詳細な設定が必要な場合は、Google Cloud Consoleで追加の設定を行います。

### 3.1 OAuth同意画面の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクト「trihackathon」を選択
3. 左サイドバーから「APIとサービス」>「OAuth同意画面」を選択
4. 必要に応じて以下を設定：
   - アプリ名: TRI-KNOT
   - サポートメール
   - アプリのロゴ
   - 承認済みドメイン
   - ホームページ、プライバシーポリシー、利用規約のURL

### 3.2 認証情報の確認

1. 「APIとサービス」>「認証情報」を選択
2. OAuth 2.0 クライアントIDが自動作成されていることを確認
3. 「承認済みのJavaScript生成元」と「承認済みのリダイレクトURI」が設定されていることを確認

## 4. 実装の確認

### 4.1 コードの実装状況

Google認証は以下のファイルで実装済みです：

- **`hooks/use-auth.ts`**: `signInWithGoogle`関数
- **`app/auth/login/login-page-client.tsx`**: ログイン画面
- **`app/auth/signup/signup-page-client.tsx`**: 新規登録画面

### 4.2 動作確認

1. 開発サーバーを起動
   ```bash
   npm run dev
   ```

2. ブラウザで以下のURLにアクセス
   - ログイン: http://localhost:3000/auth/login
   - 新規登録: http://localhost:3000/auth/signup

3. 「Googleで登録」または「Googleでログイン」ボタンをクリック

4. Googleアカウント選択画面が表示されることを確認

5. アカウントを選択して認証完了

## 5. トラブルシューティング

### エラー: "ポップアップがブロックされました"

**原因**: ブラウザのポップアップブロック機能が有効

**解決方法**:
- ブラウザの設定でポップアップを許可
- または、`signInWithRedirect`を使用（コード変更が必要）

### エラー: "このアプリは確認されていません"

**原因**: OAuth同意画面が「テスト」モードになっている

**解決方法**:
1. Google Cloud Console > OAuth同意画面
2. 「公開ステータス」を「本番」に変更
3. または、テストユーザーとして特定のGoogleアカウントを追加

### エラー: "redirect_uri_mismatch"

**原因**: リダイレクトURIが承認されていない

**解決方法**:
1. Firebase Console > Authentication > Settings > 承認済みドメイン
2. 使用するドメインが承認されていることを確認
3. Google Cloud Console > 認証情報 > OAuth 2.0 クライアントID
4. 承認済みのリダイレクトURIに以下を追加：
   - `https://<your-domain>/__/auth/handler`

## 6. セキュリティ上の注意事項

### 本番環境での推奨設定

1. **OAuth同意画面を本番モードに**
   - テストモードだと外部ユーザーがログインできない

2. **承認済みドメインを制限**
   - 本番環境のドメインのみを承認
   - 不要なドメインは削除

3. **APIキーの制限**
   - Google Cloud Console > APIとサービス > 認証情報
   - APIキーに適切な制限を設定（HTTPリファラー制限など）

4. **スコープの最小化**
   - 必要最小限のスコープのみを要求
   - デフォルトでは`email`と`profile`のみ

## 7. バックエンド連携

Google認証でサインアップした場合、以下の流れでバックエンドにユーザー情報を作成します：

1. **フロントエンド**: `signInWithGoogle()`でFirebase認証
2. **フロントエンド**: プロフィール情報入力画面（Step 2）に遷移
3. **フロントエンド**: `createMe()`でバックエンドAPIを呼び出し
4. **バックエンド**: Firebase Admin SDKでトークンを検証
5. **バックエンド**: ユーザー情報をデータベースに保存

### バックエンドで必要な処理

バックエンド側では、Firebase Admin SDKで受け取ったIDトークンを検証し、Google認証で取得したユーザー情報（UIDなど）を使ってデータベースにレコードを作成します。

```go
// 例: Go (Echo)でのトークン検証
token, err := firebaseAuth.VerifyIDToken(ctx, idToken)
if err != nil {
    return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token")
}

userID := token.UID // FirebaseのUser ID
email := token.Claims["email"].(string)
```

## 8. 参考リンク

- [Firebase Authentication - Google認証](https://firebase.google.com/docs/auth/web/google-signin?hl=ja)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Console](https://console.firebase.google.com/)
