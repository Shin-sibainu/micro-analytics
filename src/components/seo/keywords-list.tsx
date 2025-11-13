"use client";

import { useEffect, useState } from "react";

interface KeywordsListProps {
  siteId: string;
}

interface Keyword {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export function KeywordsList({ siteId }: KeywordsListProps) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/seo/keywords?siteId=${siteId}&period=30d&limit=10`
        );
        const result = await response.json();
        setKeywords(result.keywords || []);
      } catch (error) {
        console.error("Failed to fetch keywords data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            キーワードランキング
          </h3>
        </div>
        <div className="p-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          キーワードランキング
        </h3>
        <a
          href="#"
          className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          詳細 →
        </a>
      </div>
      <div className="p-6">
        {keywords.length > 0 ? (
          <div>
            {keywords.map((keyword, index) => (
              <div
                key={keyword.query || index}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 w-6">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {keyword.query}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      順位: {keyword.position.toFixed(1)} • CTR:{" "}
                      {(keyword.ctr * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {keyword.clicks.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {keyword.impressions.toLocaleString()} 表示
                  </div>
                </div>
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
}

