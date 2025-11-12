# Coffee Analytics - AI開発ガイド

このドキュメントは、AIアシスタント（Claude等）がこのプロジェクトで開発を行う際の必須ルールとガイドラインです。

---

## 1. 必須ルール

### ドキュメント参照の徹底
- **開発前に必ず `/docs` ディレクトリのドキュメントを参照すること**
- 実装方針に迷った時は以下の優先順位で確認:
  1. `docs/requirements.md` - 機能仕様の確認
  2. `docs/tech-spec.md` - 技術的な実装詳細
  3. `docs/dev-guide.md` - コーディング規約とパターン
  4. `docs/progress.md` - 現在の進捗状況とタスク

### 進捗管理の徹底
- **タスク完了時は必ず `docs/progress.md` のチェックボックスを更新すること**
- 新しいタスクに着手する際は、該当タスクを確認してから開始
- ブロッカーや課題が発生した場合は、`docs/progress.md` の「ブロッカー・課題」セクションに記録
- 週次で進捗状況を更新（完了率、KPI等）

### Next.js App Router ベストプラクティスの遵守
- **以下のNext.js App Routerベストプラクティスを必ず遵守すること**

---

## 2. Next.js App Router ベストプラクティス

### Server Components優先原則
```typescript
// ✅ GOOD - デフォルトでServer Component
export default async function Page() {
  const data = await fetch('...');
  return <div>{data}</div>;
}

// ❌ BAD - 不必要な'use client'
'use client';
export default function Page() {
  return <div>Static content</div>;
}
```

**ルール**:
- コンポーネントは**デフォルトでServer Component**として作成
- `'use client'`は以下の場合**のみ**使用:
  - `useState`, `useEffect`等のReact Hooksを使う場合
  - ブラウザAPIを使う場合（`window`, `document`）
  - イベントハンドラー（`onClick`等）を使う場合
  - サードパーティライブラリがClient専用の場合

### データフェッチング
```typescript
// ✅ GOOD - Server Componentで直接fetch
export default async function Page() {
  const data = await db.query.users.findMany();
  return <UserList users={data} />;
}

// ❌ BAD - useEffectでのfetch
'use client';
export default function Page() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/users').then(res => setData(res));
  }, []);
  return <UserList users={data} />;
}
```

**ルール**:
- Server Componentで**直接データベース・APIにアクセス**
- `useEffect`でのデータフェッチは避ける
- Client Componentからのデータフェッチは最小限に

### ファイル構成規約
```
app/
├── (auth)/                 # ルートグループ（URLに影響しない）
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx          # 認証レイアウト
├── (dashboard)/            # ダッシュボードグループ
│   ├── dashboard/
│   │   └── page.tsx
│   └── layout.tsx          # ダッシュボードレイアウト
├── api/                    # API Routes
│   └── stats/
│       └── route.ts
├── layout.tsx              # ルートレイアウト
└── page.tsx                # トップページ
```

**ルール**:
- ルートグループ `(name)` で関連ページをまとめる
- 各グループごとに `layout.tsx` を配置
- API Routesは `app/api/` 配下に配置

### メタデータ管理
```typescript
// ✅ GOOD - generateMetadata使用
export async function generateMetadata({ params }) {
  const site = await getSite(params.id);
  return {
    title: `${site.name} - Coffee Analytics`,
    description: `Analytics for ${site.domain}`,
  };
}

// ❌ BAD - 古い手法
export const metadata = {
  title: 'Static Title',
};
```

**ルール**:
- 動的メタデータは `generateMetadata` 関数を使用
- 静的メタデータは `metadata` オブジェクトで定義
- SEO重要ページは必ずメタデータを設定

### Loading UI & Error Handling
```
app/
└── dashboard/
    ├── page.tsx
    ├── loading.tsx         # 自動的にSuspense境界を作成
    └── error.tsx           # エラーバウンダリ
```

**ルール**:
- 各ルートに `loading.tsx` を配置（ローディング状態の自動処理）
- 各ルートに `error.tsx` を配置（エラーハンドリング）
- `not-found.tsx` で404ページをカスタマイズ

### キャッシング戦略（Next.js 16 Cache Components）

> **重要**: Next.js 16では、Cache Componentsが標準となりました。詳細は `docs/cache-components-guide.md` を参照してください。

#### Cache Componentsの基本原則

```typescript
// ✅ GOOD - use cache でキャッシュを明示
'use cache'
import { cacheLife } from 'next/cache'

export default async function Page() {
  cacheLife('hours')  // 更新頻度に応じたプロファイル
  const data = await fetch('https://...')
  return <div>{data}</div>
}

// ✅ GOOD - 動的データはSuspenseでラップ
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <h1>静的コンテンツ</h1>
      <Suspense fallback={<Loading />}>
        <DynamicContent />
      </Suspense>
    </>
  )
}

// ❌ BAD - 動的コードがSuspenseでラップされていない
export default async function Page() {
  const data = await fetch('https://...')  // エラー！
  return <div>{data}</div>
}
```

**ルール**:
- **デフォルトで動的**: すべてのルートはデフォルトで動的
- **明示的キャッシュ**: `use cache` でキャッシュしたい部分を明示
- **Suspenseで境界**: 動的コードは必ず `Suspense` でラップ
- **cacheLifeで期間指定**: `seconds`, `minutes`, `hours`, `days`, `weeks`, `max` から選択
- **タグで再検証**: `cacheTag()` と `revalidateTag()` で on-demand 更新

#### Cache Components有効化

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,  // 必須
}
```

#### cacheLife プロファイル選択ガイド

| プロファイル | 用途 | 例 |
|------------|------|-----|
| `seconds` | リアルタイムデータ | 株価、ライブスコア |
| `minutes` | 頻繁更新 | SNSフィード、ニュース |
| `hours` | 日に数回更新 | 商品在庫、天気 |
| `days` | 日次更新 | ブログ記事 |
| `weeks` | 週次更新 | ポッドキャスト |
| `max` | ほぼ不変 | 法的ページ、アーカイブ |

#### 旧キャッシング戦略からの移行

```typescript
// Before (Next.js 15以前)
export const revalidate = 3600
export const dynamic = 'force-static'

// After (Next.js 16 Cache Components)
'use cache'
import { cacheLife } from 'next/cache'

export default async function Page() {
  cacheLife('hours')  // revalidate の代替
  return <div>...</div>
}
```

**詳細は `docs/cache-components-guide.md` を参照**

### Server Actions
```typescript
// app/actions.ts
'use server';

export async function createSite(formData: FormData) {
  const domain = formData.get('domain');

  // バリデーション
  const result = await db.insert(sites).values({ domain });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

// Client Component
'use client';
export function SiteForm() {
  return (
    <form action={createSite}>
      <input name="domain" />
      <button type="submit">Create</button>
    </form>
  );
}
```

**ルール**:
- フォーム送信は**Server Actions**を優先的に使用
- `'use server'` ディレクティブを明示
- API Routeは外部からのアクセスが必要な場合のみ使用

### 環境変数アクセス
```typescript
// ✅ GOOD - Server Componentで直接アクセス
export default async function Page() {
  const apiKey = process.env.API_KEY; // OK
  return <div>...</div>;
}

// ❌ BAD - Client Componentで秘密情報アクセス
'use client';
export default function Page() {
  const apiKey = process.env.API_KEY; // 危険！クライアントに露出
  return <div>...</div>;
}

// ✅ GOOD - Client向けは NEXT_PUBLIC_ プレフィックス
'use client';
export default function Page() {
  const publicKey = process.env.NEXT_PUBLIC_API_KEY; // OK
  return <div>...</div>;
}
```

**ルール**:
- 秘密情報は**Server Componentでのみ**アクセス
- クライアントで必要な環境変数は `NEXT_PUBLIC_` プレフィックスを付ける
- APIキー等の秘密情報をクライアントに露出しない

---

## 3. Coffee Analytics固有のルール

### 認証（Better-Auth）
```typescript
// Server Component
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/login');
  }

  return <div>Protected content</div>;
}
```

**ルール**:
- 認証チェックはServer Componentで実行
- `headers()`は必ず`await`する（Next.js 15+）
- Better-Authの`auth.api`を使用

### データベースアクセス（Drizzle ORM）
```typescript
// lib/db/queries.ts で定義
import { db } from '@/lib/db';
import { sites } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getSite(siteId: string) {
  return await db.query.sites.findFirst({
    where: eq(sites.id, siteId),
  });
}

// Server Componentで使用
import { getSite } from '@/lib/db/queries';

export default async function SitePage({ params }) {
  const site = await getSite(params.id);
  return <div>{site.name}</div>;
}
```

**ルール**:
- DBクエリは`lib/db/queries.ts`にまとめる
- 直接Server ComponentでDB接続しない
- Drizzle ORMのリレーショナルクエリを活用

### コンポーネント配置
```
src/
├── app/                    # Pages & API Routes
├── components/
│   ├── ui/                # shadcn/ui コンポーネント
│   ├── dashboard/         # ダッシュボード専用コンポーネント
│   ├── analytics/         # 分析グラフコンポーネント
│   └── layout/            # レイアウトコンポーネント
└── lib/                   # ビジネスロジック
```

**ルール**:
- ページコンポーネントは`app/`のみ
- 再利用可能なコンポーネントは`components/`
- ビジネスロジックは`lib/`に分離

---

## 4. 開発ワークフロー

### 新機能開発時の手順
1. **計画**: `docs/requirements.md`で仕様確認
2. **設計**: `docs/tech-spec.md`でAPI/DB設計確認
3. **実装**: `docs/dev-guide.md`の規約に従って実装
4. **テスト**: 動作確認
5. **進捗更新**: `docs/progress.md`のチェックボックスを更新

### コード例
```typescript
// ✅ 理想的なNext.js App Routerコンポーネント

// app/dashboard/[siteId]/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSiteStats } from '@/lib/db/queries';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TrafficChart } from '@/components/analytics/traffic-chart';

// メタデータ
export async function generateMetadata({ params }) {
  const site = await getSite(params.siteId);
  return {
    title: `${site.name} - Dashboard`,
  };
}

// Server Component (デフォルト)
export default async function DashboardPage({
  params
}: {
  params: { siteId: string }
}) {
  // 認証チェック
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/login');
  }

  // データフェッチ（直接DB接続）
  const stats = await getSiteStats(params.siteId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Server Component */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="訪問者"
          value={stats.visitors}
        />
        <StatsCard
          title="ページビュー"
          value={stats.pageviews}
        />
        <StatsCard
          title="直帰率"
          value={`${stats.bounceRate}%`}
        />
      </div>

      {/* Client Component（インタラクティブ） */}
      <TrafficChart data={stats.traffic} />
    </div>
  );
}
```

---

## 5. チェックリスト

開発時に以下を確認すること:

### コード作成前
- [ ] `docs/requirements.md`で機能仕様を確認
- [ ] `docs/tech-spec.md`でAPI/DB設計を確認
- [ ] `docs/dev-guide.md`でコーディング規約を確認
- [ ] `docs/progress.md`で現在のタスクを確認

### コード作成時
- [ ] Server Component優先で実装
- [ ] `'use client'`は必要最小限
- [ ] データフェッチはServer Componentで直接
- [ ] 環境変数の適切な使用
- [ ] TypeScript型定義の徹底
- [ ] エラーハンドリングの実装

### コード完成後
- [ ] 動作確認
- [ ] コーディング規約の遵守確認
- [ ] `docs/progress.md`のチェックボックスを更新
- [ ] 必要に応じてドキュメント更新

---

## 6. 禁止事項

以下は**絶対にやってはいけない**こと:

- ❌ ドキュメントを参照せずに実装を開始する
- ❌ タスク完了時に`docs/progress.md`を更新しない
- ❌ 不必要に`'use client'`を使用する
- ❌ Client Componentで秘密情報にアクセスする
- ❌ `useEffect`でデータフェッチする（Server Componentで可能な場合）
- ❌ API Routeを不必要に作成する（Server Actionsで代替可能な場合）
- ❌ `any`型を使用する
- ❌ コーディング規約を無視する

### Cache Components関連の禁止事項（Next.js 16）

- ❌ 動的コードを`Suspense`でラップせずに使用する
- ❌ `use cache`内でランタイムAPI（`cookies()`, `headers()`, `searchParams`）を使用する
- ❌ Route Handler内で直接`use cache`を使用する（ヘルパー関数に抽出すること）
- ❌ `cacheLife`を指定せずに`use cache`を使用する（デフォルトが適用されるが明示すべき）
- ❌ Edge Runtimeと`use cache`を併用する（Node.jsランタイムが必要）

---

## 7. 参考リンク

- [Next.js App Router公式ドキュメント](https://nextjs.org/docs/app)
- [Next.js 16 Cache Components](https://nextjs.org/docs/app/getting-started/cache-components)
- [Server Components解説](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions解説](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)

### プロジェクト内ドキュメント

- [`docs/cache-components-guide.md`](docs/cache-components-guide.md) - Cache Componentsベストプラクティス（必読）
- [`docs/requirements.md`](docs/requirements.md) - 機能仕様
- [`docs/tech-spec.md`](docs/tech-spec.md) - 技術仕様
- [`docs/dev-guide.md`](docs/dev-guide.md) - 開発ガイド
- [`docs/progress.md`](docs/progress.md) - 進捗管理

---

**最終更新**: 2025-11-12

このドキュメントは、Coffee Analyticsプロジェクトの品質と一貫性を保つための重要なガイドラインです。必ず遵守してください。
