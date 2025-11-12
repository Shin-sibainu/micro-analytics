import { FileText } from "lucide-react";

interface PagesListProps {
  siteId: string;
}

interface PageStat {
  path: string;
  title: string | null;
  pageviews: number;
  visitors: number;
}

export async function PagesList({ siteId }: PagesListProps) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/stats/pages?siteId=${siteId}&period=7d&limit=10`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();
    const pages = data.pages || [];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            トップページ
          </h2>
          <a href="#" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
            詳細 →
          </a>
        </div>
        <div className="p-6">
        {pages.length > 0 ? (
          <div>
            {pages.map((page: PageStat, index: number) => (
              <div
                key={page.path || index}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 w-6">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {page.title || page.path || "タイトルなし"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {page.path} • {page.visitors.toLocaleString()} 訪問者
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {page.pageviews.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            データがありません
          </div>
        )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Pages list error:", error);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          人気ページ
        </h2>
        <div className="text-center py-8 text-red-500">
          エラーが発生しました
        </div>
      </div>
    );
  }
}

