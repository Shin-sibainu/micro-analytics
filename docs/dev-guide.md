# 開発ガイドライン

---

## 1. コーディング規約

### TypeScript
- **型定義**: `any`型の使用を避け、適切な型を定義
- **命名規則**:
  - コンポーネント: PascalCase (`DashboardLayout`)
  - 関数: camelCase (`getUserData`)
  - 定数: UPPER_SNAKE_CASE (`API_ENDPOINT`)
  - ファイル名: kebab-case (`user-profile.tsx`)
- **エクスポート**: Named exportを優先

### React/Next.js
- **Server Components優先**: デフォルトでServer Componentsを使用
- **Client Componentsは最小限**: `'use client'`は必要な箇所のみ
- **Hooks**: カスタムHooksは`use`プレフィックス (`useUserData`)

### Tailwind CSS
- **ユーティリティクラス優先**: カスタムCSSは最小限
- **レスポンシブ**: モバイルファースト (`sm:`, `md:`, `lg:`)
- **コンポーネント**: shadcn/ui を積極的に活用

---

## 2. プロジェクト構造ルール

### ディレクトリ構成
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証ルートグループ
│   ├── (dashboard)/       # ダッシュボードルートグループ
│   ├── api/               # APIルート
│   └── layout.tsx         # ルートレイアウト
├── components/            # 共通コンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   ├── dashboard/        # ダッシュボード専用
│   └── analytics/        # 分析グラフ
├── lib/                   # ロジック・ユーティリティ
│   ├── db/               # データベース
│   ├── auth/             # 認証
│   └── utils/            # ヘルパー関数
└── types/                 # 型定義
```

### ファイル配置ルール
- **Page Components**: `app/` 配下のみ
- **Reusable Components**: `components/` 配下
- **Business Logic**: `lib/` 配下
- **API Routes**: `app/api/` 配下

---

## 3. コンポーネント設計原則

### Server Components (デフォルト)
```typescript
// app/dashboard/page.tsx
import { getStats } from '@/lib/db/queries';

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1>Dashboard</h1>
      <StatsDisplay stats={stats} />
    </div>
  );
}
```

### Client Components (必要時のみ)
```typescript
'use client';

import { useState } from 'react';

export function InteractiveChart({ data }) {
  const [period, setPeriod] = useState('7d');

  return (
    <div>
      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        {/* ... */}
      </select>
      <Chart data={data} period={period} />
    </div>
  );
}
```

### コンポーネント構成例
```typescript
// components/dashboard/stats-card.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
            {change >= 0 ? '+' : ''}{change}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 4. データベース操作 (Drizzle ORM)

### クエリ例
```typescript
// lib/db/queries.ts
import { db } from './index';
import { sites, events } from './schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// サイト取得
export async function getSite(siteId: string) {
  return await db.query.sites.findFirst({
    where: eq(sites.id, siteId),
  });
}

// イベント集計
export async function getEventStats(siteId: string, startDate: Date) {
  return await db
    .select({
      date: events.date,
      count: sql<number>`count(*)`,
    })
    .from(events)
    .where(
      and(
        eq(events.siteId, siteId),
        gte(events.timestamp, startDate)
      )
    )
    .groupBy(events.date)
    .orderBy(desc(events.date));
}
```

### トランザクション
```typescript
export async function createSiteWithTracking(userId: string, domain: string) {
  return await db.transaction(async (tx) => {
    const site = await tx.insert(sites).values({
      userId,
      domain,
      trackingEnabled: true,
    }).returning();

    // 追加の初期化処理
    // ...

    return site[0];
  });
}
```

---

## 5. API Route 設計

### 基本構造
```typescript
// app/api/stats/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStats } from '@/lib/db/queries';
import { z } from 'zod';

const querySchema = z.object({
  siteId: z.string(),
  period: z.enum(['7d', '30d', '90d']).default('7d'),
});

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // クエリパラメータ検証
    const searchParams = request.nextUrl.searchParams;
    const { siteId, period } = querySchema.parse({
      siteId: searchParams.get('siteId'),
      period: searchParams.get('period'),
    });

    // データ取得
    const stats = await getStats(siteId, period);

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### エラーハンドリング
```typescript
// lib/api/error-handler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
}
```

---

## 6. 認証・認可

### セッション取得
```typescript
// Server Component
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function ProtectedPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/login');
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

### Client Component
```typescript
'use client';

import { useSession } from '@/lib/auth/client';

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Welcome, {session.user.name}</div>;
}
```

---

## 7. テスト戦略

### 単体テスト (Vitest)
```typescript
// lib/utils/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatNumber } from './format';

describe('formatNumber', () => {
  it('should format large numbers with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should handle small numbers', () => {
    expect(formatNumber(123)).toBe('123');
  });
});
```

### E2Eテスト (Playwright)
```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('should login with Google', async ({ page }) => {
  await page.goto('/login');
  await page.click('text=Sign in with Google');
  // OAuth フロー...
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 8. パフォーマンス最適化

### キャッシュ戦略
```typescript
// Cache Component活用
import { CacheComponent } from 'next/cache';

export default function Dashboard() {
  return (
    <>
      {/* リアルタイム: キャッシュなし */}
      <RealtimeVisitors />

      {/* 1分キャッシュ */}
      <CacheComponent ttl={60}>
        <StatsOverview />
      </CacheComponent>

      {/* 1時間キャッシュ */}
      <CacheComponent ttl={3600}>
        <SEOAnalytics />
      </CacheComponent>
    </>
  );
}
```

### データベースクエリ最適化
- インデックスを適切に設定
- N+1クエリを避ける
- ページネーション実装

---

## 9. Git ワークフロー

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `fix/*`: バグ修正

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コード整形
refactor: リファクタリング
test: テスト追加
chore: その他の変更
```

例:
```
feat: トラッキングスクリプト実装

- ca.js スクリプト作成
- イベント送信ロジック実装
- Cookie不使用でvisitorHash生成
```

---

## 10. デプロイ手順

### Vercel デプロイ
1. GitHub連携で自動デプロイ
2. 環境変数を Vercel ダッシュボードで設定
3. プレビューデプロイで確認
4. `main` ブランチへマージで本番デプロイ

### データベースマイグレーション
```bash
# スキーマ変更を適用
npm run db:push

# 本番環境
TURSO_DATABASE_URL=<production-url> npm run db:push
```

---

## 11. トラブルシューティング

### よくある問題

#### 認証エラー
- `BETTER_AUTH_SECRET` が設定されているか確認
- Google OAuth リダイレクトURLが正しいか確認

#### データベース接続エラー
- Turso の認証トークンが有効か確認
- ネットワーク接続を確認

#### ビルドエラー
- `node_modules` を削除して再インストール
- TypeScript型エラーを確認

---

## 12. 開発Tips

### shadcn/ui コンポーネント追加
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Drizzle Studio でDB確認
```bash
npm run db:studio
```

### 開発サーバー
```bash
npm run dev        # 通常起動
npm run dev:turbo  # Turbopack (高速)
```

---

## 参考リンク

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
