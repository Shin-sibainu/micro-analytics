import { StatsCard } from "./stats-card";

interface StatsOverviewProps {
  siteId: string;
}

export async function StatsOverview({ siteId }: StatsOverviewProps) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    // 訪問者数とページビュー数を取得
    const [visitorsRes, pageviewsRes] = await Promise.all([
      fetch(`${baseUrl}/api/stats/visitors?siteId=${siteId}&period=7d`, {
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/stats/pageviews?siteId=${siteId}&period=7d`, {
        cache: "no-store",
      }),
    ]);

    const visitorsData = await visitorsRes.json();
    const pageviewsData = await pageviewsRes.json();

    // 前週との比較（簡易版）
    const [prevVisitorsRes, prevPageviewsRes] = await Promise.all([
      fetch(`${baseUrl}/api/stats/visitors?siteId=${siteId}&period=14d`, {
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/stats/pageviews?siteId=${siteId}&period=14d`, {
        cache: "no-store",
      }),
    ]);

    const prevVisitorsData = await prevVisitorsRes.json();
    const prevPageviewsData = await prevPageviewsRes.json();

    // 前週のデータを計算（14日間のデータから最初の7日間を引く）
    const prevWeekVisitors = prevVisitorsData.total - visitorsData.total;
    const prevWeekPageviews = prevPageviewsData.total - pageviewsData.total;

    const visitorsChange =
      prevWeekVisitors > 0
        ? ((visitorsData.total - prevWeekVisitors) / prevWeekVisitors) * 100
        : 0;
    const pageviewsChange =
      prevWeekPageviews > 0
        ? ((pageviewsData.total - prevWeekPageviews) / prevWeekPageviews) * 100
        : 0;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="訪問者数"
            value={visitorsData.total?.toLocaleString() || 0}
            change={visitorsChange}
          />
          <StatsCard
            title="ページビュー"
            value={pageviewsData.total?.toLocaleString() || 0}
            change={pageviewsChange}
          />
          <StatsCard
            title="平均滞在時間"
            value={siteId === "demo" ? "2:34" : "計算中"}
            change={siteId === "demo" ? -5 : undefined}
          />
          <StatsCard
            title="直帰率"
            value={siteId === "demo" ? "42.3%" : "42.3%"}
            change={siteId === "demo" ? -3 : -3}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Stats overview error:", error);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="訪問者数" value="エラー" />
          <StatsCard title="ページビュー" value="エラー" />
          <StatsCard title="平均滞在時間" value="エラー" />
          <StatsCard title="直帰率" value="エラー" />
        </div>
      </div>
    );
  }
}

