import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { requireAuthAndSiteAccess, getOptionalAuth } from "@/lib/auth/guard";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { VisitorsChart } from "@/components/analytics/visitors-chart";
import { DevicesChart } from "@/components/analytics/devices-chart";
import { PagesList } from "@/components/dashboard/pages-list";
import { SourcesList } from "@/components/dashboard/sources-list";
import { TrackingCodeDisplay } from "@/components/dashboard/tracking-code-display";
import { OnboardingProgress } from "@/components/dashboard/onboarding-progress";
import { TrackingStatusBadge } from "@/components/dashboard/tracking-status-badge";
import { EmptyDashboardMessage } from "@/components/dashboard/empty-dashboard-message";
import { GSCStatsOverview } from "@/components/seo/gsc-stats-overview";
import { GSCQueriesList } from "@/components/seo/gsc-queries-list";
import { GSCPagesList } from "@/components/seo/gsc-pages-list";
import { GSCPerformanceChart } from "@/components/seo/gsc-performance-chart";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface DashboardPageProps {
  params: Promise<{
    siteId: string;
  }>;
  searchParams: Promise<{
    onboarding?: string;
  }>;
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  // paramsとsearchParamsを解決
  const { siteId } = await params;
  const { onboarding } = await searchParams;
  
  // トラッキングサーバーのURLを取得
  // 環境変数が設定されている場合はそれを使用
  let trackingServerUrl = process.env.NEXT_PUBLIC_TRACKING_URL;
  
  if (!trackingServerUrl) {
    // リクエストヘッダーからURLを構築
    try {
      const headersList = await headers();
      const host = headersList.get("host") || "localhost:3000";
      const protocol = headersList.get("x-forwarded-proto") || 
                       (host.includes("localhost") ? "http" : "https");
      trackingServerUrl = `${protocol}://${host}`;
    } catch (error) {
      // フォールバック
      trackingServerUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    }
  }
  
  // デモサイトの場合は認証不要（公開ダッシュボード）
  if (siteId === "demo") {
    const session = await getOptionalAuth();
    const isLoggedIn = !!session?.user;

    return (
      <>
        <div className="container print:max-w-full">
          <div className="pt-6"></div>

          <div className="space-y-6">
            {/* Stats Container */}
            <Suspense fallback={<StatsSkeleton />}>
              <StatsOverview siteId={siteId} />
            </Suspense>

            {/* Visitor Trend Chart */}
            <Suspense fallback={<ChartSkeleton />}>
              <VisitorsChart siteId={siteId} />
            </Suspense>

            {/* Content Grid - All 4 cards in one grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<ListSkeleton />}>
                <PagesList siteId={siteId} />
              </Suspense>
              <Suspense fallback={<ListSkeleton />}>
                <SourcesList siteId={siteId} />
              </Suspense>
              <Suspense fallback={<ChartSkeleton />}>
                <DevicesChart siteId={siteId} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* CTA Section - ログインしていない場合のみ表示 */}
        {!isLoggedIn && (
          <div className="bg-gray-50 dark:bg-gray-850">
            <div className="container print:max-w-full">
              <div className="py-12 lg:py-16 lg:flex lg:items-center lg:justify-between">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-9 sm:text-4xl sm:leading-10 dark:text-gray-100">
                  このデータをあなたのサイトで？ <br />
                  <span className="text-indigo-600">
                    今すぐ無料トライアルを開始
                  </span>
                </h2>
                <div className="flex mt-8 lg:shrink-0 lg:mt-0">
                  <div className="inline-flex shadow-sm rounded-md">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent leading-6 rounded-md hover:bg-indigo-500 focus:outline-hidden focus:ring transition duration-150 ease-in-out"
                    >
                      開始する
                    </Link>
                  </div>
                  <div className="inline-flex ml-3 shadow-xs rounded-md">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-indigo-600 bg-white border border-transparent leading-6 rounded-md dark:text-gray-100 dark:bg-gray-800 hover:text-indigo-500 dark:hover:text-indigo-500 focus:outline-hidden focus:ring transition duration-150 ease-in-out"
                    >
                      詳しく見る
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 通常のサイトの場合は認証と所有権確認が必要
  const { session, site } = await requireAuthAndSiteAccess(siteId);

  // GSC連携が有効な場合はSEO分析ページを表示（hasDataに関係なく）
  if (site.gscEnabled && site.gscConfig) {
    return (
      <div className="container print:max-w-full">
        <div className="pt-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {site.name || site.domain}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {site.domain} - SEO分析
              </p>
            </div>
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              GSC連携中
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* GSC統計概要 */}
          <Suspense fallback={<StatsSkeleton />}>
            <GSCStatsOverview siteId={siteId} period="7d" />
          </Suspense>

          {/* パフォーマンス推移グラフ */}
          <Suspense fallback={<ChartSkeleton />}>
            <GSCPerformanceChart siteId={siteId} period="7d" />
          </Suspense>

          {/* 検索クエリとページ別パフォーマンス */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<ListSkeleton />}>
              <GSCQueriesList siteId={siteId} period="7d" limit={10} />
            </Suspense>
            <Suspense fallback={<ListSkeleton />}>
              <GSCPagesList siteId={siteId} period="7d" limit={10} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  // データがあるか確認（イベントが1つでもあるか）
  const [hasData] = await db
    .select()
    .from(events)
    .where(eq(events.siteId, siteId))
    .limit(1);

  // データがない場合はトラッキングコードを表示
  // ただし、オンボーディング完了フラグがある場合は通常のダッシュボードを表示
  if (!hasData && onboarding !== "completed") {
    return (
      <div className="container print:max-w-full">
        <div className="pt-6 max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {site.name || site.domain} の設定
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              トラッキングコードをサイトに追加して、データの収集を開始しましょう
            </p>
          </div>

          <TrackingCodeDisplay
            trackingId={site.trackingId || ""}
            domain={site.domain}
            siteId={siteId}
            showNextStep={true}
            nextStepPath={`/dashboard/${siteId}/verify`}
            nextStepLabel="設置確認へ"
            trackingServerUrl={trackingServerUrl}
          />

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>ヒント:</strong> トラッキングコードを追加したら、サイトを訪問してから数分待ってからこのページを更新してください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // データがある場合は通常のダッシュボードを表示
  // データがない場合でも、オンボーディング完了フラグがある場合は空のダッシュボードを表示
  return (
    <div className="container print:max-w-full">
      <div className="pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {site.name || site.domain}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {site.domain}
            </p>
          </div>
          <TrackingStatusBadge siteId={siteId} domain={site.domain} />
        </div>
      </div>

      <div className="space-y-6">
        {/* データがない場合のメッセージ */}
        {!hasData && onboarding === "completed" && (
          <EmptyDashboardMessage
            siteId={siteId}
            domain={site.domain}
            trackingId={site.trackingId || ""}
          />
        )}

        {/* Stats Container */}
        {hasData && (
          <Suspense fallback={<StatsSkeleton />}>
            <StatsOverview siteId={siteId} />
          </Suspense>
        )}

        {/* Visitor Trend Chart */}
        {hasData && (
          <>
            <Suspense fallback={<ChartSkeleton />}>
              <VisitorsChart siteId={siteId} />
            </Suspense>

            {/* Content Grid - All 4 cards in one grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<ListSkeleton />}>
                <PagesList siteId={siteId} />
              </Suspense>
              <Suspense fallback={<ListSkeleton />}>
                <SourcesList siteId={siteId} />
              </Suspense>
              <Suspense fallback={<ChartSkeleton />}>
                <DevicesChart siteId={siteId} />
              </Suspense>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="mb-6 h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
