# 開発進捗管理

最終更新: 2025-01-27（最新）

---

## プロジェクト概要

**Coffee Analytics** - 1 分で始められる、選択的機能を持つ Web 分析ツール

- MVP 開発期間: 3 ヶ月
- 目標ローンチ: 2025 年 5 月

---

## 開発フェーズ

### Phase 1: 基礎構築 (1 ヶ月目) - 進行中 (約 85%完了)

#### Week 1-2: コア機能開発

- [x] プロジェクト環境セットアップ
  - [x] Next.js 16 プロジェクト初期化
  - [x] Tailwind CSS + shadcn/ui セットアップ
  - [x] Turso データベース接続設定
  - [x] Drizzle ORM セットアップ
- [x] ユーザー認証システム（基本設定完了）
  - [x] Better-Auth 導入
  - [x] Google OAuth 設定（設定ファイル作成済み）
  - [x] セッション管理実装（スキーマ定義済み）
- [x] 独自トラッキングスクリプト開発
  - [x] トラッキングスクリプト (ca.js) 作成
  - [x] イベント受信 API (/track) 実装
  - [x] データ保存ロジック実装
- [x] データベーススキーマ実装
  - [x] users テーブル
  - [x] sites テーブル
  - [x] events テーブル
  - [x] gscData テーブル（将来用）
  - [x] aiInsights テーブル（将来用）
  - [x] sessions テーブル（Better-Auth 用）

#### Week 3-4: ダッシュボード基礎

- [x] レイアウト・ナビゲーション構築
  - [x] ダッシュボードレイアウト (`(dashboard)/layout.tsx`)
  - [x] サイドバーコンポーネント (`dashboard-sidebar.tsx`)
  - [x] ナビゲーションバー (`dashboard-nav.tsx`)
  - [x] ダッシュボードページ構造 (`dashboard/[siteId]/page.tsx`)
- [x] リアルタイムデータ表示機能
  - [x] `RealtimeVisitors` コンポーネント作成
  - [x] API 実装 (`/api/stats/realtime`)
- [x] 基本的なグラフ実装
  - [x] グラフコンポーネントの参照構造作成
  - [x] 訪問者数グラフ実装 (`VisitorsChart`) - Recharts 使用
  - [x] ページビューグラフ実装 (`PageviewsChart`) - Recharts 使用
  - [x] デバイス分布グラフ実装 (`DevicesChart`) - Recharts 使用
- [x] ページ別統計表示
  - [x] `PagesList` コンポーネント実装
  - [x] API 実装 (`/api/stats/pages`)
- [x] 流入元分析表示
  - [x] `SourcesList` コンポーネント実装
  - [x] API 実装 (`/api/stats/sources`)
- [x] 統計概要表示
  - [x] `StatsOverview` コンポーネント実装
  - [x] 前週比計算機能
- [x] ランディングページ実装
  - [x] ナビゲーションバー (`landing-nav.tsx`)
  - [x] ヒーローセクション (`hero-section.tsx`)
  - [x] 機能紹介セクション (`features-section.tsx`)
  - [x] 価格セクション (`pricing-section.tsx`)
  - [x] CTA セクション (`cta-section.tsx`)
  - [x] フッター (`landing-footer.tsx`)
  - [x] Plausible デザインシステム適用

---

### Phase 2: 選択的機能 (2 ヶ月目) - 進行中 (約 15%完了)

#### Week 5-6: GSC 連携

- [x] Google Search Console API 連携
  - [x] OAuth スコープ拡張
  - [x] GSC データ取得 API 実装
  - [x] gscData テーブル実装（既存スキーマ）
- [x] データ同期バッチ処理
  - [x] Vercel Cron Jobs 設定
  - [x] 日次データ同期ジョブ
- [x] SEO ダッシュボード追加
  - [x] キーワードランキング表示
  - [x] CTR 分析グラフ
  - [x] 検索順位推移グラフ

#### Week 7-8: UX 改善

- [x] オンボーディングウィザード
  - [x] ステップ 1: アカウント作成（Google OAuth）
  - [x] ステップ 2: サイト登録（セッションストレージで一時保存）
  - [x] ステップ 3: 機能選択画面（基本トラッキング/GSC/GA4）
  - [x] ステップ 4: トラッキングコード表示（最後に DB 保存）
  - [x] 進捗インジケーター実装
  - [x] 「次へ」ボタンで任意に次のステップへ進める機能
- [ ] トラッキング確認機能
  - [ ] 自動検証スクリプト
  - [ ] 設置状態の可視化
- [ ] モバイル対応
  - [ ] レスポンシブデザイン調整
  - [ ] タッチ操作最適化
- [ ] エラーハンドリング強化

---

### Phase 3: AI・決済 (3 ヶ月目) - 未着手

#### Week 9-10: AI 分析

- [ ] OpenAI API 連携
  - [ ] API キー設定
  - [ ] Vercel AI SDK 導入
- [ ] AI 分析機能実装
  - [ ] aiInsights テーブル実装
  - [ ] トラフィック分析ロジック
  - [ ] SEO 改善提案ロジック
- [ ] 週次レポート生成
  - [ ] レポート生成バッチ
  - [ ] メール送信機能 (Resend)
- [ ] ダッシュボードに AI 提案表示

#### Week 11-12: 商用化

- [ ] Stripe 決済実装
  - [ ] プラン設定 (Essential/Pro/Business)
  - [ ] サブスクリプション管理
  - [ ] Webhook ハンドラー
- [ ] プラン管理機能
  - [ ] プランアップグレード/ダウングレード
  - [ ] 使用量制限チェック
  - [ ] 請求履歴表示
- [ ] メール通知システム
  - [ ] ウェルカムメール
  - [ ] 週次レポートメール
  - [ ] 請求メール
- [ ] ベータテスト開始
  - [ ] テストユーザー募集
  - [ ] フィードバック収集

---

## ローンチ準備チェックリスト

### 技術面

- [ ] 負荷テスト完了
- [ ] セキュリティ監査
- [ ] バックアップ体制構築
- [ ] 監視システム稼働 (Sentry, Vercel Analytics)

### ビジネス面

- [ ] 利用規約作成
- [ ] プライバシーポリシー作成
- [ ] ヘルプドキュメント作成
- [ ] サポート体制構築
- [ ] 初期ユーザー 50 名確保

### マーケティング

- [x] ランディングページ作成
- [ ] Product Hunt 準備
- [ ] ブログ記事 5 本執筆
- [ ] デモ動画作成

---

## 現在の状態

**ステータス**: Phase 1 進行中（Week 1-2 完了、Week 3-4 ほぼ完了）

**完了タスク**:

- ✅ プロジェクト要件定義完了
- ✅ ドキュメント体制構築
- ✅ Next.js 16 プロジェクト初期化
- ✅ Tailwind CSS v4 + shadcn/ui セットアップ
- ✅ **Turso データベース接続設定**
- ✅ **Drizzle ORM セットアップ**
- ✅ **データベーススキーマ実装**（users, sites, events, gscData, aiInsights, sessions）
- ✅ **Better-Auth 基本設定**（設定ファイル作成済み）
- ✅ **トラッキングスクリプト (ca.js) 作成**
- ✅ **イベント受信 API (/track) 実装**
- ✅ **データベースマイグレーション実行**
- ✅ ダッシュボードレイアウト・ナビゲーション構築
- ✅ **API ルート実装完了**（/api/stats/\*）
- ✅ **ダッシュボードコンポーネント実装完了**
  - `StatsOverview` - 統計概要
  - `VisitorsChart` - 訪問者数グラフ
  - `PageviewsChart` - ページビューグラフ
  - `DevicesChart` - デバイス分布グラフ
  - `PagesList` - 人気ページリスト
  - `SourcesList` - 流入元リスト
- ✅ **ランディングページ実装完了**（Plausible デザインシステム適用）

**実装済みファイル**:

**データベース関連**:

- `src/lib/db/index.ts` - Turso 接続設定
- `src/lib/db/schema.ts` - Drizzle スキーマ定義
- `drizzle.config.ts` - Drizzle 設定ファイル

**認証関連**:

- `src/lib/auth/config.ts` - Better-Auth 設定
- `src/app/api/auth/[...all]/route.ts` - 認証 API ルート

**トラッキング関連**:

- `public/ca.js` - トラッキングスクリプト
- `src/app/track/route.ts` - イベント受信 API
- `src/app/ca.js/route.ts` - スクリプト配信ルート

**UI 関連**:

- `src/app/(dashboard)/layout.tsx` - ダッシュボードレイアウト
- `src/app/(dashboard)/dashboard/[siteId]/page.tsx` - ダッシュボードページ
- `src/components/layout/dashboard-sidebar.tsx` - サイドバー
- `src/components/layout/dashboard-nav.tsx` - ナビゲーションバー
- `src/components/dashboard/realtime-visitors.tsx` - リアルタイム訪問者表示
- `src/components/dashboard/stats-card.tsx` - 統計カード
- `src/components/dashboard/stats-overview.tsx` - 統計概要
- `src/components/dashboard/pages-list.tsx` - 人気ページリスト
- `src/components/dashboard/sources-list.tsx` - 流入元リスト
- `src/components/analytics/visitors-chart.tsx` - 訪問者数グラフ
- `src/components/analytics/pageviews-chart.tsx` - ページビューグラフ
- `src/components/analytics/devices-chart.tsx` - デバイス分布グラフ
- `src/components/landing/landing-nav.tsx` - ランディングページナビゲーション
- `src/components/landing/hero-section.tsx` - ヒーローセクション
- `src/components/landing/features-section.tsx` - 機能紹介セクション
- `src/components/landing/pricing-section.tsx` - 価格セクション
- `src/components/landing/cta-section.tsx` - CTA セクション
- `src/components/landing/landing-footer.tsx` - フッター
- `src/app/page.tsx` - ランディングページ
- `src/lib/utils.ts` - ユーティリティ関数
- `components.json` - shadcn/ui 設定

**API ルート**:

- `src/app/api/stats/realtime/route.ts` - リアルタイム訪問者数
- `src/app/api/stats/visitors/route.ts` - 訪問者統計
- `src/app/api/stats/pageviews/route.ts` - ページビュー統計
- `src/app/api/stats/devices/route.ts` - デバイス統計
- `src/app/api/stats/pages/route.ts` - ページ別統計
- `src/app/api/stats/sources/route.ts` - 流入元統計

**GSC 連携関連**:

- `src/lib/gsc/client.ts` - GSC API クライアント
- `src/app/api/connect/gsc/route.ts` - GSC 連携 API（開始/解除）
- `src/app/api/sync/gsc/route.ts` - GSC データ同期バッチ処理
- `src/app/api/seo/keywords/route.ts` - キーワードランキング API
- `src/app/api/seo/ctr/route.ts` - CTR 分析 API
- `src/app/api/seo/positions/route.ts` - 検索順位推移 API
- `src/components/seo/keywords-list.tsx` - キーワードランキング表示
- `src/components/seo/ctr-chart.tsx` - CTR 推移グラフ
- `src/components/seo/positions-chart.tsx` - 検索順位推移グラフ
- `vercel.json` - Vercel Cron Jobs 設定

**次のアクション**:

1. ⚠️ **優先度高**: Better-Auth 動作確認と Google OAuth 設定（Google OAuth 設定が必要）
2. トラッキングスクリプトのテストと最適化
3. エラーハンドリングの強化
4. データがない場合の UI 改善
5. 認証ガードの実装（ダッシュボードへのアクセス制御）

---

## ブロッカー・課題

**現在の課題**:

- Google OAuth 設定が必要（`.env.local`の`GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`を設定）
- Better-Auth の動作確認（Google OAuth 設定後にテスト）
- 認証ガードの実装（ダッシュボードへのアクセス制御）
- テストデータの投入と動作確認

**技術的負債**:

- `globals.css` の `tw-animate-css` インポートエラーを修正済み

---

## KPI 追跡

### 初期目標 (6 ヶ月)

- 登録ユーザー: 0 / 500 人
- 有料ユーザー: 0 / 50 人
- MRR: 0 円 / 8-12 万円
- 解約率: N/A (目標: 月 10%以下)

### 開発進捗

- Phase 1 完了: 約 85%
  - Week 1-2: 約 95% (環境セットアップ、DB/認証/トラッキング基本実装完了、マイグレーション完了)
  - Week 3-4: 約 75% (UI 構築完了、API 実装完了、グラフコンポーネント実装完了)
- Phase 2 完了: 約 15%
  - Week 5-6: 約 100% (GSC 連携実装完了、SEO ダッシュボード実装完了)
- Phase 3 完了: 0%
- 全体進捗: 約 32%
