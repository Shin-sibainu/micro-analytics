import { Suspense } from 'react';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { RealtimeVisitors } from '@/components/dashboard/realtime-visitors';
import { VisitorsChart } from '@/components/analytics/visitors-chart';
import { PageviewsChart } from '@/components/analytics/pageviews-chart';
import { DevicesChart } from '@/components/analytics/devices-chart';
import { PagesList } from '@/components/dashboard/pages-list';
import { SourcesList } from '@/components/dashboard/sources-list';

interface DashboardPageProps {
  params: {
    siteId: string;
  };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  return (
    <div className="space-y-6 md:ml-64">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          ダッシュボード
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          サイトの分析データを確認できます
        </p>
      </div>

      <Suspense fallback={<RealtimeSkeleton />}>
        <RealtimeVisitors siteId={params.siteId} />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsOverview siteId={params.siteId} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <VisitorsChart siteId={params.siteId} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <PageviewsChart siteId={params.siteId} />
        </Suspense>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <DevicesChart siteId={params.siteId} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ListSkeleton />}>
          <PagesList siteId={params.siteId} />
        </Suspense>
        <Suspense fallback={<ListSkeleton />}>
          <SourcesList siteId={params.siteId} />
        </Suspense>
      </div>
    </div>
  );
}

function RealtimeSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
