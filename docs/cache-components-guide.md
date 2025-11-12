# Next.js 16 Cache Components ベストプラクティスガイド

このドキュメントは、Next.js 16のCache Components機能を使用する際の必須ルールとベストプラクティスです。

---

## 目次

1. [Cache Componentsとは](#cache-componentsとは)
2. [有効化方法](#有効化方法)
3. [基本概念](#基本概念)
4. [必須ルール](#必須ルール)
5. [ベストプラクティス](#ベストプラクティス)
6. [実装パターン](#実装パターン)
7. [チェックリスト](#チェックリスト)
8. [トラブルシューティング](#トラブルシューティング)

---

## Cache Componentsとは

Cache Componentsは、**Partial Prerendering (PPR)** を実装する新しいレンダリング・キャッシング手法です。

### 従来のアプローチとの違い

#### Before Cache Components
- **静的優先**: Next.jsが自動的に可能な限り事前レンダリング
- **ルート全体の制御**: `dynamic`, `revalidate`等でページ全体を制御
- **予期しない動作**: 動的コードを追加すると、ページ全体が動的になる可能性

#### With Cache Components
- **動的優先**: すべてが**デフォルトで動的**
- **細かい制御**: ファイル/コンポーネント/関数レベルで`use cache`を使用
- **明示的なキャッシング**: キャッシュしたい部分を`use cache`で明示

### メリット

```
┌─────────────────────────────────────────────┐
│  静的シェル (即座に表示)                      │
│  ┌────────────────────────────────────────┐ │
│  │ ナビゲーション (キャッシュ済み)          │ │
│  │ 商品情報 (キャッシュ済み)               │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ カート (動的・Suspense)                 │ │
│  │ おすすめ商品 (動的・Suspense)           │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

- ユーザーは**静的シェルを即座に取得**
- 動的部分は`Suspense`でストリーミング
- `use cache`で動的データもキャッシュ可能

---

## 有効化方法

### next.config.ts で有効化

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,  // Cache Componentsを有効化
}

export default nextConfig
```

---

## 基本概念

### 3つの主要ツール

#### 1. Suspense (ランタイムデータ用)

リクエスト時にのみ利用可能なデータ（ユーザー固有情報）をラップ。

**ランタイムAPIの例**:
- `cookies()`
- `headers()`
- `searchParams` prop
- `params` prop（`generateStaticParams`なしの場合）

```tsx
import { Suspense } from 'react'
import { cookies } from 'next/headers'

export default function Page() {
  return (
    <>
      <h1>このコンテンツは事前レンダリング</h1>
      <Suspense fallback={<Skeleton />}>
        <UserProfile />
      </Suspense>
    </>
  )
}

async function UserProfile() {
  const session = (await cookies()).get('session')?.value
  return <div>Welcome {session}</div>
}
```

#### 2. Suspense (動的データ用)

リクエスト間で変わる可能性があるデータ（DB、API）をラップ。

**動的データパターン**:
- `fetch()` リクエスト
- データベースクエリ
- `connection()` API

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <h1>静的コンテンツ</h1>
      <Suspense fallback={<Loading />}>
        <DynamicPosts />
      </Suspense>
    </>
  )
}

async function DynamicPosts() {
  const posts = await fetch('https://api.example.com/posts')
  const data = await posts.json()
  return <div>{/* レンダリング */}</div>
}
```

#### 3. use cache (キャッシュされたデータ用)

Server Componentやユーティリティ関数をキャッシュ。事前レンダリングに含める。

```tsx
import { cacheLife } from 'next/cache'

export async function getProducts() {
  'use cache'
  cacheLife('hours')  // キャッシュ期間を指定

  const data = await db.query('SELECT * FROM products')
  return data
}
```

---

## 必須ルール

### ✅ DO: 必ずやるべきこと

#### 1. Suspenseで動的コードをラップする

```tsx
// ✅ GOOD
export default function Page() {
  return (
    <>
      <StaticNav />
      <Suspense fallback={<Skeleton />}>
        <DynamicContent />
      </Suspense>
    </>
  )
}
```

動的コードを`Suspense`でラップしないとエラーが発生:

```
Uncached data was accessed outside of <Suspense>
This delays the entire page from rendering...
```

#### 2. use cache でランタイムAPIを使わない

```tsx
// ❌ BAD - ランタイムAPIは use cache 内で使用不可
export async function CachedComponent() {
  'use cache'
  const session = (await cookies()).get('session')  // エラー!
  return <div>...</div>
}

// ✅ GOOD - Suspenseでラップする
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserComponent />
    </Suspense>
  )
}

async function UserComponent() {
  const session = (await cookies()).get('session')
  return <div>...</div>
}
```

#### 3. cacheLife でキャッシュ期間を明示する

```tsx
// ✅ GOOD - 適切なプリセットプロファイルを使用
'use cache'
import { cacheLife } from 'next/cache'

export default async function Page() {
  cacheLife('hours')  // 更新頻度に応じて選択
  return <div>...</div>
}
```

#### 4. ルート全体をキャッシュする場合は layout.tsx と page.tsx 両方に use cache を追加

```tsx
// app/blog/layout.tsx
'use cache'

export default function Layout({ children }) {
  return <div>{children}</div>
}

// app/blog/page.tsx
'use cache'
import { cacheLife } from 'next/cache'

export default async function Page() {
  cacheLife('days')
  return <div>...</div>
}
```

### ❌ DON'T: やってはいけないこと

#### 1. 動的コードをSuspenseなしで使用しない

```tsx
// ❌ BAD
export default async function Page() {
  // Suspenseなしで動的fetch → エラー
  const data = await fetch('https://api.example.com/data')
  return <div>{data}</div>
}
```

#### 2. use cache と runtime APIs を混在させない

```tsx
// ❌ BAD
export async function Component() {
  'use cache'
  const userAgent = (await headers()).get('user-agent')  // エラー!
  return <div>...</div>
}
```

#### 3. Route Handlers内で直接 use cache を使わない

```tsx
// ❌ BAD
export async function GET() {
  'use cache'  // Route Handler内で直接使用不可
  return Response.json({ data: 'foo' })
}

// ✅ GOOD - ヘルパー関数に抽出
async function getData() {
  'use cache'
  cacheLife('hours')
  return await db.query('SELECT * FROM products')
}

export async function GET() {
  const data = await getData()
  return Response.json(data)
}
```

---

## ベストプラクティス

### 1. cacheLife プリセットプロファイルの選択

| プロファイル | 用途 | stale | revalidate | expire |
|------------|------|-------|------------|--------|
| `seconds` | リアルタイムデータ（株価、ライブスコア） | 30秒 | 1秒 | 1分 |
| `minutes` | 頻繁更新（SNSフィード、ニュース） | 5分 | 1分 | 1時間 |
| `hours` | 日に数回更新（在庫、天気） | 5分 | 1時間 | 1日 |
| `days` | 日次更新（ブログ記事） | 5分 | 1日 | 1週間 |
| `weeks` | 週次更新（ポッドキャスト） | 5分 | 1週間 | 30日 |
| `max` | ほぼ不変（法的ページ、アーカイブ） | 5分 | 30日 | 1年 |

```tsx
// リアルタイムデータ
'use cache'
cacheLife('seconds')

// ブログ記事
'use cache'
cacheLife('days')

// 規約ページ
'use cache'
cacheLife('max')
```

### 2. cacheTag と revalidateTag で on-demand 再検証

```tsx
// データ取得（タグ付け）
import { cacheTag, cacheLife } from 'next/cache'

export async function getPosts() {
  'use cache'
  cacheLife('days')
  cacheTag('blog-posts')  // タグを付与

  const posts = await db.query.posts.findMany()
  return posts
}

// Server Action（再検証）
'use server'
import { revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  await db.insert(posts).values({ title: formData.get('title') })

  // 'blog-posts' タグの付いたキャッシュを再検証
  revalidateTag('blog-posts')
}
```

### 3. updateTag vs revalidateTag の使い分け

#### updateTag: 即座に更新が必要な場合

```tsx
'use server'
import { cacheTag, updateTag } from 'next/cache'

export async function getCart() {
  'use cache'
  cacheTag('user-cart')
  return await db.query.cart.findFirst()
}

export async function updateCart(itemId: string) {
  await db.update(cart).set({ items: [...] })

  // 同じリクエスト内で即座に期限切れ＆再取得
  updateTag('user-cart')
}
```

#### revalidateTag: 遅延が許容される場合

```tsx
'use server'
import { cacheTag, revalidateTag } from 'next/cache'

export async function getPosts() {
  'use cache'
  cacheTag('posts')
  return await db.query.posts.findMany()
}

export async function createPost(formData: FormData) {
  await db.insert(posts).values({ ... })

  // stale-while-revalidate（遅延許容）
  revalidateTag('posts')
}
```

### 4. カスタムcacheLifeプロファイルの定義

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    biweekly: {
      stale: 60 * 60 * 24 * 14,      // 14日
      revalidate: 60 * 60 * 24,       // 1日
      expire: 60 * 60 * 24 * 14,      // 14日
    },
    marketing: {
      stale: 300,                      // 5分
      revalidate: 1800,                // 30分
      expire: 43200,                   // 12時間
    },
  },
}
```

```tsx
// 使用例
'use cache'
import { cacheLife } from 'next/cache'

export default async function Page() {
  cacheLife('biweekly')  // カスタムプロファイル
  return <div>...</div>
}
```

### 5. インラインキャッシュプロファイル（一度限りの設定）

```tsx
'use cache'
import { cacheLife } from 'next/cache'

export async function getLimitedOffer() {
  cacheLife({
    stale: 60,        // 1分
    revalidate: 300,  // 5分
    expire: 3600,     // 1時間
  })

  return await db.query.offers.findFirst()
}
```

---

## 実装パターン

### パターン1: ページ全体のキャッシュ

```tsx
// app/blog/layout.tsx
'use cache'

export default function BlogLayout({ children }) {
  return (
    <div className="blog-layout">
      {children}
    </div>
  )
}

// app/blog/page.tsx
'use cache'
import { cacheLife } from 'next/cache'

export default async function BlogPage() {
  cacheLife('days')  // ブログは日次更新

  const posts = await getBlogPosts()
  return <div>{/* posts */}</div>
}
```

### パターン2: コンポーネント単位のキャッシュ

```tsx
// コンポーネントごとに異なるキャッシュ戦略
export default async function Dashboard() {
  return (
    <div>
      <StaticHeader />
      <CachedStats />
      <Suspense fallback={<Loading />}>
        <RealtimeData />
      </Suspense>
    </div>
  )
}

async function CachedStats() {
  'use cache'
  cacheLife('hours')  // 統計は1時間ごとに更新

  const stats = await getStats()
  return <StatsCards data={stats} />
}

async function RealtimeData() {
  // キャッシュなし（常に最新）
  const data = await getRealtimeData()
  return <Chart data={data} />
}
```

### パターン3: ユーティリティ関数のキャッシュ

```tsx
// lib/data.ts
import { cacheLife } from 'next/cache'

export async function getSettings() {
  'use cache'
  cacheLife('max')  // 設定はほぼ不変

  return await db.query.settings.findFirst()
}

export async function getProducts() {
  'use cache'
  cacheLife('hours')  // 商品は頻繁に更新

  return await db.query.products.findMany()
}

// Server Component で使用
import { getSettings, getProducts } from '@/lib/data'

export default async function Page() {
  const settings = await getSettings()
  const products = await getProducts()

  return <div>{/* レンダリング */}</div>
}
```

### パターン4: Interleaving (キャッシュと非キャッシュの組み合わせ)

```tsx
export default async function Page() {
  const dynamicData = await getDynamicData()

  return (
    <CachedWrapper header={<h1>タイトル</h1>}>
      <DynamicComponent data={dynamicData} />
    </CachedWrapper>
  )
}

async function CachedWrapper({
  header,
  children
}: {
  header: ReactNode
  children: ReactNode
}) {
  'use cache'
  cacheLife('hours')

  const cachedData = await getCachedData()

  return (
    <div>
      {header}
      <CachedContent data={cachedData} />
      {children}  {/* 動的コンテンツはキャッシュされない */}
    </div>
  )
}
```

### パターン5: Route Handler でのキャッシュ

```tsx
// app/api/products/route.ts
import { cacheLife } from 'next/cache'

// ヘルパー関数でキャッシュ
async function getProducts() {
  'use cache'
  cacheLife('hours')

  return await db.query('SELECT * FROM products')
}

export async function GET() {
  const products = await getProducts()
  return Response.json(products)
}
```

---

## チェックリスト

### 実装前
- [ ] `next.config.ts`で`cacheComponents: true`を設定
- [ ] どのデータがランタイムデータか識別
- [ ] どのデータがキャッシュ可能か識別
- [ ] 適切な`cacheLife`プロファイルを選択

### 実装中
- [ ] 動的コードは必ず`Suspense`でラップ
- [ ] `use cache`内でランタイムAPI（`cookies`, `headers`等）を使用していない
- [ ] `cacheLife`でキャッシュ期間を明示
- [ ] 必要に応じて`cacheTag`でタグ付け
- [ ] Route Handler内で直接`use cache`を使用していない

### 実装後
- [ ] Suspense boundary の fallback UI が適切
- [ ] キャッシュ戦略が更新頻度と一致
- [ ] タグベースの再検証が適切に動作
- [ ] ビルドエラーがない
- [ ] ブラウザでページが正常にレンダリング

---

## トラブルシューティング

### エラー1: `Uncached data was accessed outside of <Suspense>`

**原因**: 動的コードが`Suspense`でラップされていない

**解決策**:

```tsx
// ❌ 問題のあるコード
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data}</div>
}

// ✅ 修正後
export default function Page() {
  return (
    <>
      <h1>静的コンテンツ</h1>
      <Suspense fallback={<Loading />}>
        <DynamicData />
      </Suspense>
    </>
  )
}

async function DynamicData() {
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()
  return <div>{json.content}</div>
}
```

### エラー2: `use cache` で runtime API を使用

**原因**: `cookies()`, `headers()`等を`use cache`内で使用

**解決策**:

```tsx
// ❌ 問題のあるコード
async function Component() {
  'use cache'
  const session = (await cookies()).get('session')
  return <div>...</div>
}

// ✅ 修正1: Suspenseでラップ
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserComponent />
    </Suspense>
  )
}

async function UserComponent() {
  // use cache を削除
  const session = (await cookies()).get('session')
  return <div>...</div>
}

// ✅ 修正2: use cache: private を使用（ユーザー固有キャッシュ）
async function Component() {
  'use cache: private'
  const session = (await cookies()).get('session')
  return <div>...</div>
}
```

### エラー3: Route Handler で直接 use cache を使用

**原因**: Route Handler本体で`use cache`を使用

**解決策**:

```tsx
// ❌ 問題のあるコード
export async function GET() {
  'use cache'  // エラー
  return Response.json({ data: 'foo' })
}

// ✅ 修正後: ヘルパー関数に抽出
async function getData() {
  'use cache'
  cacheLife('hours')
  return await db.query('SELECT * FROM data')
}

export async function GET() {
  const data = await getData()
  return Response.json(data)
}
```

### エラー4: Edge Runtime との互換性

**問題**: Cache Components は Node.js ランタイムが必要

**解決策**:

```tsx
// ❌ 問題のあるコード
export const runtime = 'edge'

export default async function Page() {
  'use cache'  // Edge Runtime ではエラー
  return <div>...</div>
}

// ✅ 修正後: Edge Runtime を削除するか、use cache を削除
export default async function Page() {
  // use cache を使わない、または runtime = 'edge' を削除
  return <div>...</div>
}
```

---

## Route Segment Config からの移行

Cache Componentsを有効化すると、いくつかのRoute Segment Configが不要または非対応になります。

### `dynamic = "force-dynamic"` → 不要

```tsx
// Before
export const dynamic = 'force-dynamic'

// After - 削除するだけ（デフォルトで動的）
export default function Page() {
  return <div>...</div>
}
```

### `dynamic = "force-static"` → `use cache` に置き換え

```tsx
// Before
export const dynamic = 'force-static'

// After
export default async function Page() {
  'use cache'
  return <div>...</div>
}
```

### `revalidate` → `cacheLife` に置き換え

```tsx
// Before
export const revalidate = 3600  // 1時間

// After
import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife('hours')  // またはカスタム設定
  return <div>...</div>
}
```

### `fetchCache` → 不要

```tsx
// Before
export const fetchCache = 'force-cache'

// After - use cache で自動的にキャッシュ
export default async function Page() {
  'use cache'
  // すべてのfetchが自動的にキャッシュ
  return <div>...</div>
}
```

### `runtime = 'edge'` → 非対応

```tsx
// Before
export const runtime = 'edge'

// After - Cache Components は Node.js が必要
// Edge Runtime を使用する場合は use cache を使わない
```

---

## まとめ

### 基本原則

1. **動的優先**: すべてがデフォルトで動的
2. **明示的キャッシュ**: `use cache` でキャッシュしたい部分を明示
3. **Suspenseで境界を作る**: 動的部分は`Suspense`でラップ
4. **適切なcacheLife**: 更新頻度に応じたプロファイルを選択
5. **タグで再検証**: `cacheTag`と`revalidateTag`でon-demand更新

### よくあるパターン

```tsx
// パターン1: ページ全体キャッシュ
'use cache'
cacheLife('days')

// パターン2: 部分的キャッシュ + 動的部分
<CachedComponent />
<Suspense><DynamicComponent /></Suspense>

// パターン3: ユーティリティ関数キャッシュ
async function getData() {
  'use cache'
  cacheLife('hours')
  return data
}

// パターン4: タグベース再検証
cacheTag('my-data')
revalidateTag('my-data')
```

---

**最終更新**: 2025-11-12

このガイドは、Next.js 16の公式ドキュメント（v16.0.1）に基づいています。
