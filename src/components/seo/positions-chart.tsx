"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PositionsChartProps {
  siteId: string;
  query?: string;
}

export function PositionsChart({ siteId, query }: PositionsChartProps) {
  const [data, setData] = useState<
    Array<{ date: string; position: number; clicks: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = query
          ? `/api/seo/positions?siteId=${siteId}&query=${encodeURIComponent(query)}&period=30d`
          : `/api/seo/positions?siteId=${siteId}&period=30d`;
        const response = await fetch(url);
        const result = await response.json();
        // 日付フォーマットを変換（YYYY-MM-DD -> M/D）
        const formattedData = (result.positions || []).map(
          (item: { date: string; position: number; clicks: number }) => {
            const date = new Date(item.date);
            return {
              date: `${date.getMonth() + 1}/${date.getDate()}`,
              position: item.position,
              clicks: item.clicks,
            };
          }
        );
        setData(formattedData);
      } catch (error) {
        console.error("Failed to fetch positions data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, query]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          検索順位推移（過去30日）
          {query && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              - {query}
            </span>
          )}
        </h3>
      </div>
      <div className="relative" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#374151", fontSize: "0.875rem" }}
              className="dark:text-gray-300"
            />
            <YAxis
              tick={{ fill: "#374151", fontSize: "0.875rem" }}
              reversed
              className="dark:text-gray-300"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                padding: "12px",
                border: "1px solid #374151",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                color: "#ffffff",
              }}
              labelStyle={{ color: "#f3f4f6", marginBottom: "4px" }}
              itemStyle={{ color: "#ffffff", fontWeight: "600" }}
              formatter={(value: number) => [`${value.toFixed(1)}位`, "順位"]}
            />
            <Line
              type="monotone"
              dataKey="position"
              stroke="#4f46e5"
              strokeWidth={2}
              name="順位"
              dot={false}
              activeDot={{
                r: 6,
                fill: "#4f46e5",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

