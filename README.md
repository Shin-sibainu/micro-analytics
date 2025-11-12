This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 環境変数設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

### 必須環境変数（Week 1-2 で使用）

```bash
# Turso Database
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Better-Auth
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (Better-Auth用)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### オプション環境変数（Phase 2-3 で使用）

```bash
# OpenAI (Phase 3で使用)
OPENAI_API_KEY=your-openai-api-key

# Stripe (Phase 3で使用)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Resend (Phase 3で使用)
RESEND_API_KEY=your-resend-api-key
```

### 環境変数の取得方法

#### 1. Turso Database

1. [Turso](https://turso.tech/) にアカウント作成
2. ダッシュボードでデータベースを作成
3. `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` を取得

#### 2. Better-Auth Secret

32 文字以上のランダムな文字列を生成：

```bash
# Node.jsで生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3. Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. 「API とサービス」→「認証情報」で OAuth 2.0 クライアント ID を作成
3. 承認済みのリダイレクト URI に `http://localhost:3000/api/auth/callback/google` を追加
4. `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` を取得

## Getting Started

まず、環境変数を設定してから開発サーバーを起動します：

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
