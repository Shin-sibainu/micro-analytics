"use client";

import { useEffect, useState } from "react";

interface DevicesChartProps {
  siteId: string;
}

interface DeviceData {
  deviceType: string;
  count: number;
}

export function DevicesChart({ siteId }: DevicesChartProps) {
  const [data, setData] = useState<
    Array<{ name: string; value: number; count: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/stats/devices?siteId=${siteId}&period=7d`
        );
        const result = await response.json();

        // デバイス種別のデータを整形
        const deviceData = (result.devices || []).map((item: DeviceData) => ({
          name:
            item.deviceType === "desktop"
              ? "デスクトップ"
              : item.deviceType === "mobile"
              ? "モバイル"
              : item.deviceType === "tablet"
              ? "タブレット"
              : item.deviceType || "その他",
          value: item.count,
          count: item.count,
        }));

        setData(deviceData);
      } catch (error) {
        console.error("Failed to fetch devices data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const deviceIcons: Record<string, string> = {
    デスクトップ: "💻",
    モバイル: "📱",
    タブレット: "📲",
    その他: "🖥️",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          デバイス
        </h3>
        <a
          href="#"
          className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          詳細 →
        </a>
      </div>
      <div className="p-6">
        {data.length > 0 ? (
          <div>
            {data.map((item, index) => {
              const percentage =
                total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
              const icon = deviceIcons[item.name] || "🖥️";
              return (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {icon} {item.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-sm transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
            データがありません
          </div>
        )}
      </div>
    </div>
  );
}
