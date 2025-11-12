# セットアップガイド

## 1. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください。

### 必須環境変数

#### Turso Database

```bash
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

**取得方法**:
1. [Turso](https://turso.tech/) にアカウント作成・ログイン
2. ダッシュボードで「Create Database」をクリック
3. データベース名を入力して作成
4. 「Connect」タブから `Database URL` と `Auth Token` をコピー

#### Better-Auth

```bash
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
```

**BETTER_AUTH_SECRETの生成方法**:
```bash
# Node.jsで生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# または opensslで生成
openssl rand -hex 32
```

#### Google OAuth

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**取得方法**:
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
5. アプリケーションの種類を「ウェブアプリケーション」に設定
6. 承認済みのリダイレクトURIに以下を追加：
   - `http://localhost:3000/api/auth/callback/google`
   - 本番環境のURL（例: `https://yourdomain.com/api/auth/callback/google`）
7. 作成されたクライアントIDとシークレットをコピー

### オプション環境変数（Phase 2-3で使用）

```bash
# OpenAI API (Phase 3: AI分析機能)
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe (Phase 3: 決済機能)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Resend (Phase 3: メール送信)
RESEND_API_KEY=re_your-resend-api-key
```

## 2. データベースマイグレーション

環境変数を設定したら、データベーススキーマを適用します：

```bash
# マイグレーションファイルを生成
npm run db:generate

# データベースにスキーマを適用
npm run db:push

# または、Drizzle Studioでデータベースを確認
npm run db:studio
```

## 3. 開発サーバーの起動

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 4. トラッキングスクリプトのテスト

1. ダッシュボードでサイトを作成
2. トラッキングIDを取得
3. テスト用のHTMLページに以下を追加：

```html
<script defer data-site="YOUR_TRACKING_ID" src="/ca.js"></script>
```

4. ページを開いてイベントが記録されることを確認

## トラブルシューティング

### データベース接続エラー

- `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` が正しく設定されているか確認
- Tursoダッシュボードでデータベースが作成されているか確認

### Better-Authエラー

- `BETTER_AUTH_SECRET` が32文字以上であることを確認
- `BETTER_AUTH_URL` が正しいURLであることを確認（開発環境は `http://localhost:3000`）

### Google OAuthエラー

- Google Cloud ConsoleでOAuth同意画面が設定されているか確認
- リダイレクトURIが正しく設定されているか確認
- `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` が正しいか確認

