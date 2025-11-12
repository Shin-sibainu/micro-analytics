# 技術仕様書

## 1. 技術スタック概要

### フロントエンド
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Charts**: Recharts
- **Auth**: Better-Auth (Google OAuth)

### バックエンド
- **Framework**: Next.js API Routes (App Router)
- **Database**: Turso (LibSQL)
- **ORM**: Drizzle ORM
- **Cache**: Next.js Cache API + Turso埋め込みレプリカ
- **Realtime**: Pusher or Ably
- **AI**: OpenAI API (GPT-4o-mini) + Vercel AI SDK

### インフラ
- **Hosting**: Vercel (Edge Network)
- **Database**: Turso (グローバル分散SQLite)
- **Payment**: Stripe
- **Email**: Resend
- **Monitoring**: Vercel Analytics, Sentry, Posthog

---

## 2. データベーススキーマ (Drizzle ORM)

### 主要テーブル

#### users
```typescript
{
  id: text (PK)
  email: text (unique)
  name: text
  image: text
  googleId: text (unique)
  planType: text (default: 'essential')
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### sites
```typescript
{
  id: text (PK)
  userId: text (FK -> users)
  domain: text
  name: text
  trackingId: text (unique)
  trackingEnabled: boolean (default: true)
  gscEnabled: boolean (default: false)
  ga4ImportCompleted: boolean (default: false)
  gscConfig: json
  ga4Config: json
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### events
```typescript
{
  id: integer (PK, autoIncrement)
  siteId: text (FK -> sites)
  eventType: text
  visitorHash: text
  sessionHash: text
  url: text
  path: text
  title: text
  referrer: text
  deviceType: text
  screenSize: text
  browser: text
  os: text
  country: text
  eventName: text
  eventValue: json
  timestamp: timestamp
  date: text (generated)
  hour: integer (generated)
}
```

#### gscData
```typescript
{
  id: integer (PK, autoIncrement)
  siteId: text (FK -> sites)
  date: text
  query: text
  page: text
  country: text
  device: text
  clicks: integer
  impressions: integer
  ctr: real
  position: real
  createdAt: timestamp
}
```

#### aiInsights
```typescript
{
  id: text (PK)
  siteId: text (FK -> sites)
  insightType: text
  dataSources: text
  content: json
  createdAt: timestamp
  expiresAt: timestamp
}
```

---

## 3. API エンドポイント設計

### 認証 (Better-Auth)
```
GET    /api/auth/sign-in/google
GET    /api/auth/callback/google
POST   /api/auth/sign-out
GET    /api/auth/session
```

### Google連携
```
POST   /api/connect/gsc
POST   /api/connect/ga4
DELETE /api/connect/gsc
DELETE /api/connect/ga4
```

### トラッキング
```
POST   /track
GET    /ca.js
POST   /beacon
```

### データ取得
```
# 基本分析
GET /api/stats/overview
GET /api/stats/realtime
GET /api/stats/pages
GET /api/stats/sources
GET /api/stats/devices

# SEO分析 (GSC連携時のみ)
GET /api/seo/keywords
GET /api/seo/pages
GET /api/seo/positions
GET /api/seo/ctr

# AI分析
GET  /api/insights/summary
GET  /api/insights/suggestions
POST /api/insights/analyze

# 管理
GET  /api/sites
GET  /api/sites/:id/status
POST /api/sites/:id/verify
```

---

## 4. ファイル構成

```
micro-analytics/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   ├── (dashboard)/       # ダッシュボードページ
│   │   ├── api/               # API Routes
│   │   └── layout.tsx
│   ├── components/            # UIコンポーネント
│   │   ├── ui/               # shadcn/ui
│   │   ├── dashboard/        # ダッシュボード
│   │   └── analytics/        # 分析グラフ
│   ├── lib/                   # ユーティリティ
│   │   ├── db/               # Drizzle ORM設定
│   │   ├── auth/             # Better-Auth設定
│   │   ├── api/              # API クライアント
│   │   └── utils/            # ヘルパー関数
│   └── types/                 # TypeScript型定義
├── docs/                      # ドキュメント
├── public/                    # 静的ファイル
└── scripts/                   # ツールスクリプト
```

---

## 5. Next.js 16 最適化

### Cache Components
```typescript
// ダッシュボードでキャッシュ戦略を活用
<CacheComponent ttl={60}>
  <StatsOverview siteId={siteId} />
</CacheComponent>

<CacheComponent ttl={3600}>
  <SEOAnalytics siteId={siteId} />
</CacheComponent>
```

### Server Components
- データフェッチは基本的にServer Componentsで実行
- リアルタイムデータのみClient Componentsを使用

### Partial Prerendering
- 静的部分と動的部分を分離
- 高速な初期表示を実現

---

## 6. セキュリティ

### 認証
- Better-Auth (OAuth 2.0)
- セッショントークン暗号化
- CSRF保護

### API
- レート制限: 1分100リクエスト
- 認証必須エンドポイント
- 入力バリデーション (Zod)

### データ保護
- 環境変数で秘密情報管理
- SQLインジェクション対策 (Drizzle ORM)
- XSS対策 (Next.jsデフォルト)

---

## 7. パフォーマンス目標

- ダッシュボード初期表示: < 2秒
- API応答時間: < 500ms (平均)
- トラッキングスクリプト: < 1KB (gzip)
- データ更新: リアルタイム〜1分遅延

---

## 8. 開発環境セットアップ

### 必要な環境変数
```bash
# Database
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
TURSO_SYNC_URL=

# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BETTER_AUTH_SECRET=

# AI
OPENAI_API_KEY=

# Payment
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=

# Realtime (選択)
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
```

### セットアップ手順
```bash
# 依存関係インストール
npm install

# データベースマイグレーション
npm run db:push

# 開発サーバー起動
npm run dev
```
