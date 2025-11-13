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

**BETTER_AUTH_SECRET の生成方法**:

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
   - **重要**: このプロジェクトで作成した CLIENT_ID と CLIENT_SECRET を`.env.local`に設定します
   - 後で設定を変更する場合は、**この同じプロジェクト**で変更します
3. **Search Console API を有効化**:
   - 「API とサービス」→「ライブラリ」に移動
   - 「Google Search Console API」を検索
   - 「有効にする」をクリック
4. **OAuth 2.0 認証情報を作成**:
   - 「API とサービス」→「認証情報」に移動
   - 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
   - アプリケーションの種類を「ウェブアプリケーション」に設定
   - 承認済みのリダイレクト URI に以下を追加：
     - `http://localhost:3000/api/auth/callback/google`
     - 本番環境の URL（例: `https://yourdomain.com/api/auth/callback/google`）
   - 作成されたクライアント ID とシークレットをコピー
   - `.env.local`に設定（`GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`）
5. **OAuth 同意画面を設定**（初回のみ）:
   - 「OAuth 同意画面」タブに移動
   - ユーザータイプを選択（外部または内部）
   - アプリ名、ユーザーサポートメール、デベロッパーの連絡先情報を入力
   - **スコープを追加**（`https://www.googleapis.com/auth/webmasters.readonly`）
   - テストユーザーを追加（開発中の場合）

**どの GCP プロジェクトで設定するか？**

**`.env.local`に設定されている`GOOGLE_CLIENT_ID`に対応する GCP プロジェクトで設定します。**

確認手順：

1. `.env.local`ファイルを開く
2. `GOOGLE_CLIENT_ID`の値を確認（例: `803093806187-0vlugj29m31shaoqt1skg2fijndksvqc.apps.googleusercontent.com`）
3. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
4. プロジェクト一覧から、その CLIENT_ID を作成したプロジェクトを選択
5. そのプロジェクトで「Google Search Console API」を有効化し、OAuth 同意画面でスコープを追加

**重要な注意点**:

- GCP プロジェクトの設定は**アプリ開発者が一度だけ**行います
- **ユーザーがログインする Google アカウントは、GCP プロジェクトの所有者である必要はありません**
- ただし、GSC 連携を使用するには、ログインしたユーザーの Google アカウントが、Google Search Console に登録されているサイトの所有者である必要があります

### オプション環境変数（Phase 2-3 で使用）

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
2. トラッキング ID を取得
3. テスト用の HTML ページに以下を追加：

```html
<script defer data-site="YOUR_TRACKING_ID" src="/ca.js"></script>
```

4. ページを開いてイベントが記録されることを確認

## トラブルシューティング

### データベース接続エラー

- `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` が正しく設定されているか確認
- Turso ダッシュボードでデータベースが作成されているか確認

### Better-Auth エラー

- `BETTER_AUTH_SECRET` が 32 文字以上であることを確認
- `BETTER_AUTH_URL` が正しい URL であることを確認（開発環境は `http://localhost:3000`）

### Google OAuth エラー

- Google Cloud Console で OAuth 同意画面が設定されているか確認
- リダイレクト URI が正しく設定されているか確認
- `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` が正しいか確認
