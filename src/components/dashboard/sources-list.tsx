"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface SourcesListProps {
  siteId: string;
}

interface SourceStat {
  domain: string;
  visitors: number;
  pageviews: number;
}

const COLORS = ["#4f46e5", "#818cf8", "#a5b4fc", "#c7d2fe"];

export function SourcesList({ siteId }: SourcesListProps) {
  const [sources, setSources] = useState<SourceStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/stats/sources?siteId=${siteId}&period=7d&limit=10`
        );
        const data = await response.json();
        setSources(data.sources || []);
      } catch (error) {
        console.error("Sources list error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  // チャート用データを整形（上位4つ）
  const totalVisitors = sources.reduce((sum, s) => sum + s.visitors, 0);
  const chartData = sources.slice(0, 4).map((source) => ({
    name: source.domain,
    value: parseFloat(
      totalVisitors > 0
        ? ((source.visitors / totalVisitors) * 100).toFixed(1)
        : "0"
    ),
  }));

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            流入元
          </h3>
          <a
            href="#"
            className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            詳細 →
          </a>
        </div>
        <div className="p-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          流入元
        </h3>
        <a
          href="#"
          className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          詳細 →
        </a>
      </div>
      <div className="p-6">
        {chartData.length > 0 ? (
          <div className="relative max-w-[240px] mx-auto">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#4f46e5"
                  dataKey="value"
                  innerRadius={52}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    padding: "12px",
                    border: "1px solid #374151",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    color: "#f3f4f6",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value, entry: any) =>
                    `${value} (${entry.payload.value}%)`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            データがありません
          </div>
        )}
      </div>
    </div>
  );
}
