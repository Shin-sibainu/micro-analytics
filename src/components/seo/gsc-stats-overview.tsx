"use client";

import { useEffect, useState } from "react";

interface GSCStatsOverviewProps {
  siteId: string;
  period?: "7d" | "30d" | "90d";
}

interface GSCSummary {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export function GSCStatsOverview({ siteId, period = "7d" }: GSCStatsOverviewProps) {
  const [summary, setSummary] = useState<GSCSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/gsc/stats?siteId=${siteId}&period=${period}`);
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const data = await response.json();
        setSummary(data.summary);
      } catch (error) {
        console.error("Failed to fetch GSC stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, period]);

  if (loading) {
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
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">データがありません</p>
      </div>
    );
  }

  const stats = [
    {
      title: "クリック数",
      value: summary.clicks.toLocaleString(),
      icon: "👆",
    },
    {
      title: "インプレッション",
      value: summary.impressions.toLocaleString(),
      icon: "👁️",
    },
    {
      title: "CTR",
      value: `${summary.ctr.toFixed(2)}%`,
      icon: "📊",
    },
    {
      title: "平均ポジション",
      value: summary.position.toFixed(1),
      icon: "📍",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 last:border-b-0 lg:border-b-0 lg:border-r border-r-gray-200 dark:border-r-gray-700 lg:last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

