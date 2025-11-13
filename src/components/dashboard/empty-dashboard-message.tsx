"use client";

import { RefreshCw, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmptyDashboardMessageProps {
  siteId: string;
  domain: string;
  trackingId: string;
}

export function EmptyDashboardMessage({
  siteId,
  domain,
  trackingId,
}: EmptyDashboardMessageProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
          <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          データの収集を待っています
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          トラッキングコードが設置されている場合、サイトを訪問するとデータが表示され始めます。
          データが表示されるまで数分かかる場合があります。
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            ページを更新
          </button>
        </div>
      </div>
    </div>
  );
}

