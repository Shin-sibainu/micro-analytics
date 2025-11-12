import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { VisitorsChart } from "@/components/analytics/visitors-chart";
import { DevicesChart } from "@/components/analytics/devices-chart";
import { PagesList } from "@/components/dashboard/pages-list";
import { SourcesList } from "@/components/dashboard/sources-list";

interface DashboardPageProps {
  params: Promise<{
    siteId: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  // paramsを解決
  const { siteId } = await params;
  
  // ログイン状態を確認
  const session = await auth.api.getSession({
    headers: await headers(),
  });
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
